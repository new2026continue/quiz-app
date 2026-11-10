// src/core/QuizEngine.js
// 测验引擎：管理词条、出题、切换，不碰 DOM

import { generateRandomInteger } from '../utils/random.js';
import { QUESTIONS_PATH } from '../main.js';
import {showToast} from "../ui/toast.js";

export class QuizEngine {
  #entries;          // 私有：词条数组
  #currentIndex;     // 私有：当前索引
  #previousIndex;    // 私有：上一个索引
  #bankName;
  /**
   * @param {Array<{question: string, answers: string[], desc: string}>} entries
   */
  constructor(entries,bankName) {
    this.#bankName = bankName
    this.#entries = entries
    this.#currentIndex = null
    this.#previousIndex = null
    
    
  }
  #setCurrentIndex(index){
    const min = 0
    const max = this.size - 1
    if(index < min) index = min
    if(index > max) index = max
    this.#currentIndex = index
  }
  /** 词条总数 */
  get size() {
    return this.#entries.length
  }
  get bankName(){
    return this.#bankName;
  }
  /** 是否为空 */
  isEmpty() {
    return this.size === 0
  }
  get currentIndex(){
    return this.#currentIndex
  }
  /** 获取当前词条 */
 getCurrent() {
  return this.#entries[this.#currentIndex] ?? null;
}
getIndexs(){
  return {
    previous:this.#previousIndex,
    current:this.#currentIndex
  }
}

setEntries(entries){
  this.#entries = entries
}
  /**
   * 随机获取下一条，避免与上一条重复
   * @returns {object|null} 词条，空数组时返回 null
   */
  getNext() {
    if(this.size === 0)return null
    if (this.size === 1) {
  this.#setCurrentIndex(0)
  return this.#entries[0];
}
    if(this.#currentIndex !== undefined){
      this.#previousIndex = this.#currentIndex
    }
    let rdmIndex = generateRandomInteger(0,this.size-1)
    while(rdmIndex === this.#previousIndex){
      rdmIndex = generateRandomInteger(0,this.size-1)
    }
   
    this.#setCurrentIndex(rdmIndex)
    return this.#entries[rdmIndex]
  }

  /**
   * 按索引获取词条
   * @param {number} index
   * @returns {object|null} 越界返回 null
   */
getByIndex(index) {
  // if (!Number.isInteger(index) || index < 0 || index >= this.size) {
  //   return null;
  // }
  this.#previousIndex = this.#currentIndex;
  this.#setCurrentIndex(index)
  return this.getCurrent();
}
insertLast(...entry){
  this.#entries.push(...entry)
}
async removeCurrent(){

      
 let resp= await fetch(QUESTIONS_PATH+`/${this.getCurrent().id}`,{
    method:'delete',
    credentials: "include" ,
  })

    if (!resp.ok) {
        showToast(`删除失败：${resp.status}`, 'error');
        return;
    }
    this.#entries.splice(this.currentIndex,1)
    showToast('删除成功', 'success');

}
modifyCurrent(after){
  this.#entries[this.currentIndex] = after
  
}

}




