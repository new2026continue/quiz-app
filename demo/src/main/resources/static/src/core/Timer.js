// src/core/Timer.js
// 计时器：封装 setInterval，支持启动、停止、切换、改间隔，不碰 DOM

export class Timer {
  #callback;
  #intervalMs;
  #timerId;

  /**
   * @param {Function} callback - 每次到点执行的函数
   * @param {number} intervalMs - 间隔毫秒，必须正整数
   */
  constructor(callback, intervalMs) {
    if(typeof callback !== 'function'){throw new TypeError("callback不是函数")}
    if(!Number.isInteger(intervalMs)||intervalMs<=0){throw new TypeError("intervalMs不是正整数")}
    this.#callback = callback
    this.#intervalMs = intervalMs
    this.#timerId = null
  }

  /** 是否运行中 */
  get isRunning() {
    return this.#timerId !== null;
  }

  /** 当前间隔毫秒 */
  get intervalMs() {
    return this.#intervalMs;
  }

  /** 启动：已在运行则不重复启动 */
  start() {
    if(this.isRunning){return}
    this.#timerId = setInterval(this.#callback,this.#intervalMs)
  }
// this.#timerId = setInterval(() => this.#callback(), this.#intervalMs);
  /** 停止：未运行则什么都不做 */
  stop() {
    if(!this.isRunning){return}
    clearInterval(this.#timerId)
    this.#timerId = null
  }

  /** 切换：运行则停，停则启 */
  toggle() {
    if(this.isRunning){
      this.stop()
    }else{
      this.start()
    }
  }

  /**
   * 改间隔：校验正整数；运行中则重启，未运行只改配置
   * @param {number} intervalMs
   */
  changeInterval(intervalMs) {
    if(!Number.isInteger(intervalMs)){throw new TypeError("intervalMs不是整数"+"收到: "+intervalMs)}
    this.#intervalMs=intervalMs;
    if(this.isRunning){
      this.stop()
      this.start()
    }


  }
}

