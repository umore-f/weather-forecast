// src/utils/echarts-config.js
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
  ScatterChart,
  PieChart,
  GaugeChart,
  // 其他图表类型
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PolarComponent,
  // AngleAxisComponent,
  // RadiusAxisComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  // 其他组件
} from 'echarts/components';
import {
  CanvasRenderer,
  // SVGRenderer
} from 'echarts/renderers';
// import {
//   // 主题
//   LightTheme
// } from 'echarts/themes';

// 注册组件
echarts.use([
  LineChart,
  BarChart,
  ScatterChart,
  PieChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PolarComponent,
  // AngleAxisComponent,
  // RadiusAxisComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  CanvasRenderer,
  // LightTheme
]);

export default echarts;
