// src/utils/echarts-config.js
// 引入 echarts 核心模块
import * as echarts from 'echarts/core'

// 引入需要使用的图表类型
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart
  // 添加其他需要的图表...
} from 'echarts/charts'

// 引入需要的组件
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  // 添加其他需要的组件...
} from 'echarts/components'

// 引入渲染器
import {
  CanvasRenderer
  // 如果需要 SVG 渲染，也可以引入 SVGRenderer
} from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  CanvasRenderer
])

// 导出配置好的 echarts 实例
export default echarts
