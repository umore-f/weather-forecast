<template>
  <div ref="mapContainer" class="weather-map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const props = defineProps({
  cities: {
    type: Array,
    required: true,
    default: () => []
  },
  weatherData: {
    type: Array,
    default: () => []
  },
  center: {
    type: Object,
    default: () => ({ lat: 35.0, lng: 105.0 })
  },
  zoom: {
    type: Number,
    default: 5
  },
  showHeatmap: {
    type: Boolean,
    default: false
  },
  heatmapField: {
    type: String,
    default: 'temp'
  }
});

const mapContainer = ref(null);
let map = null;
let markersLayer = null;
let heatmapLayer = null;
let provinceLayer = null;        // 存储省份图层
let geoJsonDataRaw = null;       // 缓存原始 GeoJSON 数据

// 中国大致范围（含南海）
const chinaBounds = L.latLngBounds(
  L.latLng(3.0, 73.0),
  L.latLng(53.5, 135.0)
);

// 修复 Leaflet 图标路径（Vite）
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// ---------- 温度颜色映射 ----------
// 输入温度值，返回对应的颜色（十六进制）
function getColorByTemp(temp) {
  if (temp === null || temp === undefined) return '#cccccc'; // 无数据时灰色
  // 根据温度范围定义颜色（可自行调整阈值）
  if (temp <= -20) return '#2c7bb6';
  if (temp <= -10) return '#5e9ed6';
  if (temp <= 0) return '#91bfdb';
  if (temp <= 10) return '#ffffb2';
  if (temp <= 20) return '#fed976';
  if (temp <= 30) return '#feb24c';
  if (temp <= 40) return '#fd8d3c';
  return '#bd0026';
}

// ---------- 根据天气数据计算各省平均温度 ----------
function getProvinceTemperatures() {
  const provinceTemps = new Map(); // 存储每个省份的温度总和与计数

  // 遍历天气数据，假设 weatherData 中每个对象有 city 和 temp 字段
  props.weatherData.forEach(item => {
    const cityName = item.city;
    const temp = item[props.heatmapField]; // 使用热力图字段（如 temp）
    if (!cityName || temp === undefined || temp === null) return;
    const cityInfo = props.cities.find(c => c.city === cityName);
    console.log("@@@@@@@@",cityInfo);

    const province = cityInfo?.province;
    if (!province) return;

    if (!provinceTemps.has(province)) {
      provinceTemps.set(province, { sum: 0, count: 0 });
    }
    const data = provinceTemps.get(province);
    data.sum += temp;
    data.count++;
  });

  // 计算平均温度
  const result = new Map();
  for (const [province, { sum, count }] of provinceTemps.entries()) {
    result.set(province, sum / count);
  }
  return result;
}

// ---------- 根据温度重新着色省份 ----------
function updateProvinceColors() {
  if (!provinceLayer) return;

  const provinceTemps = getProvinceTemperatures();

  // 重新设置每个 feature 的样式
  provinceLayer.eachLayer(layer => {
    const props = layer.feature?.properties;
    // 尝试获取省份名称（根据你的 GeoJSON 属性字段调整）
    const provinceName = props?.name || props?.省 || props?.NAME;
    if (provinceName) {
      const avgTemp = provinceTemps.get(provinceName);
      const color = getColorByTemp(avgTemp);
      layer.setStyle({
        fillColor: color,
        fillOpacity: 0.6,
        color: '#3388ff',     // 边界线颜色
        weight: 1,
        fill: true
      });
    } else {
      // 无省份名称时使用默认样式
      layer.setStyle({
        fillColor: '#cccccc',
        fillOpacity: 0.3,
        color: '#3388ff',
        weight: 1,
        fill: true
      });
    }
  });
}

// ---------- 加载并初始化省份图层 ----------
async function initProvinceLayer() {
  try {
    if (!geoJsonDataRaw) {
      const response = await fetch('src/assets/map/中国_省.geojson');
      geoJsonDataRaw = await response.json();
    }

    // 如果已有图层，先移除
    if (provinceLayer) {
      map.removeLayer(provinceLayer);
    }

    // 创建新图层，初始样式（后续会重新着色）
    provinceLayer = L.geoJSON(geoJsonDataRaw, {
      style: {
        fill: true,
        fillColor: '#cccccc',
        fillOpacity: 0.3,
        color: '#3388ff',
        weight: 1
      },
      onEachFeature: (feature, layer) => {
        // 可选：绑定点击弹窗显示省份名和温度
        const provinceName = feature.properties?.name || feature.properties?.省 || feature.properties?.NAME;
        layer.bindPopup(`
          <b>${provinceName || '未知省份'}</b><br/>
          ${(() => {
            const temps = getProvinceTemperatures();
            const avgTemp = temps.get(provinceName);
            return avgTemp !== undefined ? `平均温度: ${avgTemp.toFixed(1)}°C` : '暂无温度数据';
          })()}
        `);
      }
    }).addTo(map);

    // 着色
    updateProvinceColors();

    // 自动适配视野
    map.fitBounds(provinceLayer.getBounds());
  } catch (err) {
    console.error('加载或渲染省份边界失败：', err);
  }
}

// ---------- 热力图与标记点逻辑 ----------
const loadHeatmap = () => {
  const heatData = props.weatherData
    .filter(item => item.lat && item.lon && item[props.heatmapField] != null)
    .map(item => [
      parseFloat(item.lat),
      parseFloat(item.lon),
      parseFloat(item[props.heatmapField])
    ]);

  if (heatData.length === 0) {
    console.warn('没有可用于热力图的数据点');
    return;
  }

  if (heatmapLayer) map.removeLayer(heatmapLayer);
  heatmapLayer = L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 10,
    minOpacity: 0.5,
    gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
  }).addTo(map);
};

const updateMarkers = () => {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  props.cities.forEach(city => {
    if (!city.lat || !city.lon) return;

    const cityData = props.weatherData
      .filter(d => d.city === city.city)
      .sort((a, b) => new Date(b.forecast_time) - new Date(a.forecast_time));
    const latest = cityData[0];

    const popupContent = `
      <div style="min-width: 180px; font-size: 13px; line-height: 1.4;">
        <strong style="font-size: 14px;">${city.city}</strong><br/>
        🌡️ 温度: ${latest?.temp ?? 'N/A'}°C<br/>
        💧 湿度: ${latest?.humidity ?? 'N/A'}%<br/>
        🌬️ 风速: ${latest?.wind_speed ?? 'N/A'} km/h<br/>
        ☁️ 天气: ${latest?.weather_text ?? 'N/A'}<br/>
        📅 日期: ${latest?.forecast_time ?? 'N/A'}
      </div>
    `;

    const marker = L.marker([city.lat, city.lon]).addTo(markersLayer);
    marker.bindPopup(popupContent);
  });
};

// ---------- 地图初始化 ----------
onMounted(async () => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    maxBounds: chinaBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 4,
    maxZoom: 12,
    zoomControl: true
  }).setView([props.center.lat, props.center.lng], props.zoom);

  // 初始化省份图层（包含温度着色）
  await initProvinceLayer();

  // 初始化标记图层
  markersLayer = L.layerGroup().addTo(map);

  if (props.showHeatmap) {
    loadHeatmap();
  } else {
    updateMarkers();
  }

  setTimeout(() => map.invalidateSize(), 100);
});

// ---------- 监听数据变化 ----------
watch([() => props.weatherData, () => props.cities], () => {
  nextTick(() => {
    // 天气数据变化时，更新省份颜色
    if (provinceLayer) {
      updateProvinceColors();
    }
    // 同时更新热力图或标记
    if (props.showHeatmap) {
      if (heatmapLayer) map.removeLayer(heatmapLayer);
      loadHeatmap();
    } else {
      if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
      }
      updateMarkers();
    }
  });
}, { deep: true });

watch(() => props.showHeatmap, () => {
  nextTick(() => {
    if (props.showHeatmap) {
      if (heatmapLayer) map.removeLayer(heatmapLayer);
      loadHeatmap();
    } else {
      if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
      }
      updateMarkers();
    }
  });
});

defineExpose({ map });
</script>

<style scoped>
.weather-map-container {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f2f5; /* 空白背景色 */
}
</style>
