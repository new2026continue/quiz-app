// src/core/QuizEngine.js
// 测验引擎：管理词条、出题、切换，不碰 DOM

import { generateRandomInteger } from '../utils/random.js';

export class QuizEngine {
  #entries;          // 私有：词条数组
  #currentIndex;     // 私有：当前索引
  #previousIndex;    // 私有：上一个索引

  /**
   * @param {Array<{question: string, answers: string[], description: string}>} entries
   */
  constructor(entries) {
    this.#entries = entries
    this.#currentIndex = null
    this.#previousIndex = null

    
  }
  #setCurrentIndex(index)
  {
    const min = 0
    const max = this.getEntriesLength() - 1
    if(index < min) index = min
    if(index > max) index = max
    this.#currentIndex = index
  }


  getCurrentIndex()
  {
    return this.#currentIndex
  }
  /** 获取当前词条 */
  getCurrentEntry()
  {
    return this.#entries[this.#currentIndex] ?? null;// undefined 转换为 null
  }


  setEntries(entries)
  {
    this.#entries = entries

  }
  /**
   * 随机获取下一条，避免与上一条重复
   * @returns {object|null} 词条，空数组时返回 null
   */
  getNextEntry()
  {
    if(this.#entries.length === 0) return null
    if (this.#entries.length === 1)
    {
      this.#currentIndex = 0
      return this.#entries[0];
    }

    let rdmIndex = generateRandomInteger(0,this.#entries.length-1)
    while(rdmIndex === this.#previousIndex){
      rdmIndex = generateRandomInteger(0,this.#entries.length-1)
    }
    if(this.#currentIndex !== undefined && this.#currentIndex !== null)
    {
      this.#previousIndex = this.#currentIndex
    }
    
    this.#currentIndex = rdmIndex
    return this.#entries[rdmIndex]
  }

  /**
   * 按索引获取词条
   * @param {number} index
   * @returns {object|null} 越界返回 null
   */
  getOneEntryByIndex(index)
  {
    if(!Number.isInteger(index) || index < 0 || index >= this.#entries.length)
    {
      throw new Error("无效的索引")
    }
    this.#previousIndex = this.#currentIndex;
    this.#setCurrentIndex(index)
    return this.getCurrentEntry();
  }
 insertEntryLast(...entry)
 {
  this.#entries.push(...entry)
 }
  removeCurrentEntry()
  {
    this.#entries.splice(this.#currentIndex,1)
  }
  updateCurrentEntry(entry)
  {
    this.#entries[this.#currentIndex] = entry
    
  }
  
  getEntriesLength()
  {
    return this.#entries.length
  }
  entriesIsEmpty() 
  {
    return this.#entries.length === 0
  }

}




