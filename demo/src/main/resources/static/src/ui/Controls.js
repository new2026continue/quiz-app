// src/ui/Controls.js
// 控件：把用户操作转成对 QuizEngine / Timer / RecordView 的调用
// 只负责“接线”，不写业务逻辑，不自己找 DOM 元素
import { fetchEntries ,addOneEntry, refresh,reloadBank,fetchBankNames,QUESTIONS_PATH} from '../main.js';
import { View } from './View.js';
import { mainContainer , addViewTemplate , htmlElements} from '../HTMLelements.js';
import { showToast } from './Toast.js';
export class Controls {
  #quizEngine;
  #timer;
  #view;
  #elements;
  #handlers;

  /**
   * @param {{
   *   quizEngine: import('../core/QuizEngine.js').QuizEngine,
   *   timer: import('../core/Timer.js').Timer,
   *   view: import('./RecordView.js').RecordView,
   *   elements: {
   *     toggleBtn: HTMLButtonElement,
   *     nextBtn: HTMLButtonElement,
   *     intervalInput: HTMLInputElement,
   *     jumpInput: HTMLInputElement,
   *     descEl: HTMLElement
   *   }
   * }} deps
   */
  constructor({ quizEngine, timer, view, elements }) {
    if (!quizEngine) throw new TypeError('Controls: 缺少 quizEngine');
    if (!timer) throw new TypeError('Controls: 缺少 timer');
    if (!view) throw new TypeError('Controls: 缺少 view');
    if (!elements) throw new TypeError('Controls: 缺少 elements');

    this.#quizEngine = quizEngine;
    this.#timer = timer;
    this.#view = view;
    this.#elements = elements;

    // 所有处理函数用箭头函数，this 永远指向 Controls 实例
    // 存成私有字段，destroy 时用同一引用解绑
    this.#handlers = {
      toggle: () => this.#handleToggle(),
      next: () => this.next(),
      interval: (e) => this.#handleIntervalChange(e),
      jump: this.#debounce((e) => this.#handleJump(e),300),
      add: (e) => this.#handleAdd(e),
      submitSave: (e) => this.#handleSubmitSave(e),
      cancelSave: (e) => this.#handleCancelSave(e),
      drop: (e) =>this.#handleDrop(e),
      edit: (e) =>this.#handleEdit(e),
    };
  }

  /**
   * 绑定所有事件
   * @returns {void}
   */
  bindEventListenter() {
    const { toggleBtn, nextBtn, intervalInput, jumpInput, addBtn} = this.#elements;
    toggleBtn.addEventListener('click', this.#handlers.toggle);
    nextBtn.addEventListener('click', this.#handlers.next);
    intervalInput.addEventListener('input', this.#handlers.interval);
    jumpInput.addEventListener('input', this.#handlers.jump);
    addBtn.addEventListener('click', this.#handlers.add)
    deleteCurrent.addEventListener('click',this.#handlers.drop)
    editCurrent.addEventListener('click',this.#handlers.edit)
  }

  /**
   * 解绑所有事件，防止内存泄漏
   * @returns {void}
   */
  destroy() {
    const { toggleBtn, nextBtn, intervalInput, jumpInput } = this.#elements;
    toggleBtn.removeEventListener('click', this.#handlers.toggle);
    nextBtn.removeEventListener('click', this.#handlers.next);
    intervalInput.removeEventListener('input', this.#handlers.interval);
    jumpInput.removeEventListener('input', this.#handlers.jump);
    document.removeEventListener('keydown', this.#handlers.keydown);
    this.#elements.addBtn.removeEventListener('click', this.#handlers.add)
  }

    /**
   * 防抖：连续触发时只执行最后一次
   * @param {Function} fn - 要执行的函数
   * @param {number} delay - 延迟毫秒
   * @returns {Function}
   */
  #debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
  get quizEngine(){
    return this.#quizEngine
  }
  /**
   * 公开：下一条
   * timer 回调和首次渲染都调它
   * @returns {void}
   */
  next() {
    const entry = this.#quizEngine.getNext();
    this.#renderCurrent(entry);
  }

  /**
   * 渲染当前词条并更新描述角标
   * @param {{question: string, answers: string[], desc: string}|null} entry
   * @returns {void}
   */
  #renderCurrent(entry) {
    if(this.#elements.toggleBtn.textContent=='暂停'){
      this.#timer.start()
    }
    if (!entry) {
      this.#view.clear();
      return;
    }
    this.#view.render(entry);
    this.#elements.jumpInput.value = this.#quizEngine.currentIndex +1
    this.#elements.intervalInput.value = this.#timer.intervalMs/1000
  }

async #handleDrop(){
  const isLast = this.#quizEngine.size-1===this.#quizEngine.currentIndex
  await this.#quizEngine.removeCurrent()
  if(isLast){
    this.#renderCurrent(this.#quizEngine.getByIndex(this.#quizEngine.size-1))
  }else{

    this.#renderCurrent(this.#quizEngine.getCurrent())
  }
}
  #handleAdd(e){

    this.#timer.stop()

    htmlElements.controlsContainer.style.visibility = 'hidden'

   const view =  new View(mainContainer, addViewTemplate)
   view.render()
   addViewBankName.value = this.#quizEngine.bankName
    const   submitSaveBtn = document.getElementById('submitSaveBtn');
    const   cancelSaveBtn = document.getElementById('cancelSaveBtn');
   
    cancelSaveBtn.addEventListener('click', this.#handlers.cancelSave)
    submitSaveBtn.addEventListener('click', this.#handlers.submitSave)
  }

 async #handleEdit(e){
    this.#timer.stop()
    htmlElements.controlsContainer.style.visibility = 'hidden'
    const view =  new View(mainContainer, addViewTemplate)
    view.render()
    const entry = this.#quizEngine.getCurrent()
    addViewBankName.value = this.#quizEngine.bankName
    addViewQuestion.value = entry.question
    addViewAnswer.value = entry.answers.join()
    addViewDesc.value = entry.desc
    const   submitSaveBtn = document.getElementById('submitSaveBtn');
    const   cancelSaveBtn = document.getElementById('cancelSaveBtn');
   
    cancelSaveBtn.addEventListener('click', this.#handlers.cancelSave)
    submitSaveBtn.addEventListener('click',async function submitModify(e){
       e.preventDefault()
  const entry = {
    bankName: addViewBankName.value,
    question: addViewQuestion.value,
    desc: addViewDesc.value,
    answers: addViewAnswer.value.split(";")
  }
  
   const resp = await  fetch(QUESTIONS_PATH+`/${this.#quizEngine.getCurrent().id}`,{
        method:'put',
        headers:{
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body:JSON.stringify(entry)
      })
      const after = await resp.json()
        if (!resp.ok) {
            showToast(`修改失败: ${resp.status}`, 'error');
            return;
        }
        showToast('修改成功', 'success');
      this.#quizEngine.modifyCurrent(after)
      this.#handleCancelSave()

    }.bind(this))


  }


async #handleSubmitSave(e){
  e.preventDefault()
  const entry = {
    bankName: addViewBankName.value,
    question: addViewQuestion.value,
    desc: addViewDesc.value,
    answers: addViewAnswer.value.split(";")
  }
  const hasBank= (await fetchBankNames()).includes(entry.bankName)
 const  resp =await addOneEntry(entry)
    if (!resp.ok){
        showToast(`添加失败: ${resp.status}`, 'error');
        return
    }
    showToast('添加成功', 'success');
  
  if(hasBank===false){
    reloadBank(entry.bankName)
  }else{
    refresh()
  }
  this.#handleCancelSave()
}

#handleCancelSave(e){
  this.#renderCurrent(this.#quizEngine.getCurrent())
  htmlElements.controlsContainer.style.visibility = 'visible'
}

  /**
   * 自动 / 暂停
   * @returns {void}
   */
  #handleToggle() {
    this.#timer.toggle();
    this.#elements.toggleBtn.setAttribute(
  'aria-pressed',
  String(this.#timer.isRunning)
);
    if(this.#timer.isRunning){
        this.#elements.toggleBtn.classList.add('controls__toggle-btn--active')
       this.#elements.toggleBtn.textContent =  '暂停'
    }else{
      this.#elements.toggleBtn.textContent =  '自动'
      this.#elements.toggleBtn.classList.remove('controls__toggle-btn--active')
      
    }
  }

  /**
   * 间隔输入变更：秒 → 毫秒
   * 非法输入（空、NaN、<= 0）直接忽略，不改变现有间隔
   * @param {Event} e
   * @returns {void}
   */
  #handleIntervalChange(e) {
    const seconds = parseFloat(e.target.value);
    
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    this.#timer.changeInterval(seconds * 1000);
    
    
  }

  /**
   * 跳转到指定索引
   * 注意：0 是合法索引，不能用真假值判断
   * @param {Event} e
   * @returns {void}
   */
  #handleJump(e) {
    const index = Number(e.target.value) - 1;
    if (!Number.isInteger(index)) return;
    const entry = this.#quizEngine.getByIndex(index);
    this.#renderCurrent(entry);
  }

  set setQuizEngine(val){
    this.#quizEngine=val
  }
}