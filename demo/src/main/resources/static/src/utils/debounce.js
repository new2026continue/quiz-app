  
  
      /**
   * 防抖：连续触发时只执行最后一次
   * @param {Function} fn - 要执行的函数
   * @param {number} delay - 延迟毫秒
   * @returns {Function}
   */
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export {
    debounce
}