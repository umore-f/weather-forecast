export const formatTime = (apiTimeString) => {
  const date = new Date(apiTimeString);
  console.log('传入的参数为',apiTimeString);
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleTimeString('zh-CN',{ hour: '2-digit', minute: '2-digit' })
  } else {
    console.log('日期转换失败');
  }
}

export const formatDateToMonthDay = (apiTimeString) => {
  const date = new Date(apiTimeString);
  console.log('传入的参数为', apiTimeString);

  if (date instanceof Date && !isNaN(date)) {
    // 获取月份和日期，月份需要+1（因为getMonth()返回0-11）
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 格式化为 MM-DD 形式，确保两位数
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } else {
    console.log('日期转换失败，参数：', apiTimeString);
    return '无效日期';
  }
}
