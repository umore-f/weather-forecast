import { use } from 'echarts/core'; // 从 vue-echarts 文档推荐的核心方式引入
import { CanvasRenderer } from 'echarts/renderers'; // 渲染器
import { BarChart, LineChart } from 'echarts/charts'; // 图表类型
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'; // 组件

// 注册必要的模块
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent
]);
