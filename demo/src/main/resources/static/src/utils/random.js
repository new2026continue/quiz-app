// QuizEngine
// src/utils/random.js

// 随机数工具：纯函数，无副作用

/**
 * 生成 [min, max] 闭区间内的随机整数
 * @param {number} min - 最小值（包含），必须是整数
 * @param {number} max - 最大值（包含），必须是整数
 * @returns {number} 随机整数
 * @throws {TypeError} 参数不是整数时
 * @throws {RangeError} min > max 时
 */
function generateRandomInteger(min, max){
  if(!Number.isInteger(min))throw new TypeError(`最小值不是整数, min=${min}`)
  if(!Number.isInteger(max))throw new TypeError(`最大值不是整数, max=${max}`)
  if(min > max)throw new RangeError(`最小值不能超过最大值, ${min}>${max}`)
  if(min === max)return min
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



export {generateRandomInteger}