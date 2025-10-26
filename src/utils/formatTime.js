export const formatTime = (apiTimeString) => {
  const date = new Date(apiTimeString);
  console.log('传入的参数为',apiTimeString);
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleTimeString('zh-CN',{ hour: '2-digit', minute: '2-digit' })
  } else {
    console.log('日期转换失败');
  }
}
