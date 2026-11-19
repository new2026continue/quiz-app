// src/ui/Controls.js
// 控件：把用户操作转成对 QuizEngine / Timer / RecordView 的调用
// 只负责“接线”，不写业务逻辑，不自己找 DOM 元素
import * as requestApi from '../data/request.js'
import {debounce} from '../utils/debounce.js'
import{QuizEngine} from '../core/QuizEngine.js'
import {RecordView} from './RecordView.js'
import {View} from './View.js'
import {showToast} from './toast.js'
import {Timer} from '../core/Timer.js'
const quizEngines = new Map(); // 利用闭包存储
const _handlers = {}
let _quizEngine = null
let _timer = null; 
let _view = null;
let _elements = null;

const controller = {
  init({ timer, view, elements })
  {
    if (!timer) throw new TypeError('Controls: 缺少 timer');
    if (!view) throw new TypeError('Controls: 缺少 view');
    if (!elements) throw new TypeError('Controls: 缺少 elements');
    if(!(timer instanceof Timer)) throw new TypeError('controller初始化失败: timer 不是 Timer 实例');
    if(!(view instanceof RecordView)) throw new TypeError('controller初始化失败: view 不是 RecordView 实例');
    if(!(elements instanceof Object)) throw new TypeError('controller初始化失败: elements 不是对象实例');
    _timer = timer;
    _view = view;
    _elements = elements;
  },
  /**
   * 给所有控件绑事件处理器
   * @returns {void}
   */
  bindEventListenter()
  {
    _elements.bankSelect.addEventListener('change', _handlers.handleBankChange);
    _elements.toggleAutoBtn.addEventListener('click', _handlers.handleAutoToggleClick);
    _elements.nextBtn.addEventListener('click', this.next);
    _elements.intervalInput.addEventListener('input', _handlers.handleIntervalInput);
    _elements.jumpInput.addEventListener('input', debounce(_handlers.handleJumpInput, 200));// 给处理器加防抖
    _elements.addBtn.addEventListener('click', _handlers.handleAddClick)
    _elements.deleteCurrentBtn.addEventListener('click',_handlers.handleDropClick)
    _elements.editCurrentBtn.addEventListener('click',_handlers.handleEditClick)
    _elements.logoutBtn.addEventListener('click',_handlers.handleLogoutClick)
    _elements.cancelSaveBtn.addEventListener('click', _handlers.handleCancelSaveClick)
    _elements.submitSaveBtn.addEventListener('click', _handlers.handleSubmitSaveClick)
  },
  /**
   * 解绑所有控件的事件处理器
   * @returns {void}
   */
  destroyEventListenter()
  {
    _elements.bankSelect.removeEventListener('change', _handlers.handleBankChange);
    _elements.toggleAutoBtn.removeEventListener('click', _handlers.handleAutoToggleClick);
    _elements.nextBtn.removeEventListener('click', this.next);
    _elements.intervalInput.removeEventListener('input', _handlers.handleIntervalInput);
    _elements.jumpInput.removeEventListener('input', debounce(_handlers.handleJumpInput, 200));
    _elements.addBtn.removeEventListener('click', _handlers.handleAddClick)
    _elements.deleteCurrentBtn.removeEventListener('click',_handlers.handleDropClick)
    _elements.editCurrentBtn.removeEventListener('click',_handlers.handleEditClick)
    _elements.logoutBtn.removeEventListener('click',_handlers.handleLogoutClick)
    _elements.cancelSaveBtn.removeEventListener('click', _handlers.handleCancelSaveClick)
    _elements.submitSaveBtn.removeEventListener('click', _handlers.handleSubmitSaveClick)
  },
  /**
   * 从当前_quizEngine随机取一条题目由_view渲染
   * @returns {void}
   */
  next()
  { if(_quizEngine.getEntriesLength() === 0)_view.renderEmpty()
    const entry = _quizEngine.getNextEntry();
    if (!entry) {
      _view.clear();
      return;
    }
    if(_elements.toggleAutoBtn.classList.contains('controls__toggle-btn--active')) {
      _timer.start()
    }
    _view.renderEntry(entry);// 往内容区渲染
    _elements.jumpInput.value = _quizEngine.getCurrentIndex() + 1
    _elements.intervalInput.value = _timer.intervalMs / 1000 //每次渲染的是新元素, 需要更新间隔
  },

  getQuizEngine()
  {
    return _quizEngine
  },
  setQuizEngine(engine)
  {
    _quizEngine = engine
  },
  handlers: _handlers,
}

_handlers.handleDropClick = async function()
  { 
    try{
      // 检查是否是最后一一条
      const isLast = _quizEngine.getEntriesLength()-1 === _quizEngine.getCurrentIndex()
      // 检查是否是唯一一条
      const isOne = _quizEngine.getEntriesLength() === 1
      showToast('删除中...','info',6000)
      
      // 发送删除请求, 从数据库移除当前条目
      const result =  await requestApi.dropOneQuestionById(_quizEngine.getCurrentEntry().id)
      // 从本地数组中移除当前条目
      _quizEngine.removeCurrentEntry()
      
      showToast('删除成功','success')
      refreshBankList()
      
      if(isOne){
        _view.clear() // 清空容器
        _elements.jumpInput.value = ''

        _view.renderEmpty() // css 渲染空状态
      }
      else if(isLast){
        // 如果删除的是最后一条，渲染上一条
        
        _view.renderEntry(_quizEngine.getOneEntryByIndex(_quizEngine.getEntriesLength()-1)) 
        _elements.jumpInput.value = _quizEngine.getCurrentIndex() +1

      }else{
        // 默认渲染下一条
        _view.renderEntry(_quizEngine.getCurrentEntry())
      }
      }catch(error){
        showToast(`${error.message}`,'error')
      }     
  }
    
_handlers.handleLogoutClick = async function()
{
  try{
    await requestApi.logout()
    // showToast('退出成功','success')
    location.href = './auth.html';
  }catch(error){
    showToast(`${error.message}`,'error')
  }
}

_handlers.handleAddClick = function()
{
  _timer.stop() // 销毁调度器, 保存当前索引
  _elements.recordEditorTitle.textContent = '添加新条目'
  // 如果片段被清空了, 
  _elements.recordFormContainer.classList.add('record-form-container--add')
  new View(_elements.main).renderHtmlElement(_elements.recordFormContainer)// 统一由view操作文档树
  _elements.bankNameInput.value = _elements.bankSelect.value
}

_handlers.handleEditClick = function() 
{
    _timer.stop() // 销毁调度器, 保存当前索引
    new View(_elements.main).renderHtmlElement(_elements.recordFormContainer)
    _elements.recordEditorTitle.textContent = '修改当前条目'
    _elements.recordFormContainer.classList.add('record-form-container--modify')

    const entry = _quizEngine.getCurrentEntry();// 由本地数组回显当前条目信息
    _elements.bankNameInput.value = _elements.bankSelect.value;
    _elements.questionInput.value = entry.question;
    _elements.descriptionInput.value = entry.desc;
    _elements.answersInput.value = entry.answers.join(";");
  }

_handlers.handleCancelSaveClick = function()
{  if(_quizEngine.getEntriesLength() === 0)_view.renderEmpty()
  _view.renderEntry(_quizEngine.getCurrentEntry())
  new View(_elements.main).replaceAllHtmlElementFor(_elements.contentContainer, _elements.controlsContainer)
     if(_elements.toggleAutoBtn.classList.contains('controls__toggle-btn--active')){
        _timer.start()
      }
  _elements.bankNameInput.value = ''
  _elements.questionInput.value = ''
  _elements.descriptionInput.value = ''
  _elements.answersInput.value = ''
  _elements.recordFormContainer.classList.remove('record-form-container--add')
  _elements.recordFormContainer.classList.remove('record-form-container--modify')

}

_handlers.handleSubmitSaveClick = async function(e)
{
   e.preventDefault() // 阻止表单默认提交
   
   
   const entry = {
    bankName: _elements.bankNameInput.value.trim(),
    question: _elements.questionInput.value.trim(),
    desc: _elements.descriptionInput.value.trim(),
    answers: _elements.answersInput.value.trim().split(";")
  }
  
  
  try{
    if(_elements.recordFormContainer.classList.contains('record-form-container--modify'))
    {// 修改
          showToast('修改中...','info',6000)
          const result = await requestApi.updateOneQuestion(_quizEngine.getCurrentEntry().id,entry)
          _quizEngine.updateCurrentEntry(result)
        showToast('修改成功','success') //远程本地都修改成功, 更新提示状态
         _handlers.handleCancelSaveClick()
    }else
    {// 新增
      showToast('新增中...','info',6000)
      // 检查题库是否存在
        const hasBank= (await requestApi.fetchAllBankName(sessionStorage.getItem('username'))).includes(entry.bankName)
        entry.username = sessionStorage.getItem('username')
        const result = await requestApi.addOneQuestion(entry)


        if(hasBank===false){
        refreshBankList()
      
        
      }else{
      
        reloadBank(entry.bankName)
      }
      addBank(entry.bankName)
      _handlers.handleBankChange(undefined,entry.bankName)
      _handlers.handleCancelSaveClick()
      showToast('新增成功','success')
      
    }
       
    }catch(error){
      showToast(`${error.message}`,'error')
      console.log(error)
    }finally{
       
    }
  }

_handlers.handleAutoToggleClick = function() {
    _timer.toggle();
    _elements.toggleAutoBtn.setAttribute(
  'aria-pressed',
  String(_timer.isRunning)
);
    if(_timer.isRunning){
        _elements.toggleAutoBtn.classList.add('controls__toggle-btn--active')
       _elements.autoToggleBtnText.textContent =  '暂停'
    }else{
      _elements.autoToggleBtnText.textContent =  '自动'
      _elements.toggleAutoBtn.classList.remove('controls__toggle-btn--active')
      
    }
  }
_handlers.handleIntervalInput = function(e) {
    const seconds = parseFloat(e.target.value);

  if (!Number.isFinite(seconds) || seconds <= 0) return;
  _timer.changeInterval(seconds * 1000);
 
}
_handlers.handleJumpInput = function(e) {
     let index = Number(e.target.value) - 1;
   
    if (!Number.isInteger(index)) return;
    if(index < 0 ){
      index = _quizEngine.getEntriesLength() - 1
    };
    if(index >= _quizEngine.getEntriesLength()){
      index = 0
    };
    const entry = _quizEngine.getOneEntryByIndex(index);
    _view.renderEntry(entry);
    _elements.jumpInput.value = index + 1
    
  }

 _handlers.handleBankChange = function(e,bank)
 {
    const bankName = bank ?? _elements.bankSelect.value;
   
    
    const quizEngine = quizEngines.get(bankName);
   
    
    if (!quizEngine) return;
    controller.setQuizEngine(quizEngine);
    if(quizEngine.getEntriesLength() === 0){
      _view.renderEmpty()
      return
    }
    _view.renderEntry(quizEngine.getOneEntryByIndex(0));
      _elements.jumpInput.value = _quizEngine.getCurrentIndex() + 1
    _elements.intervalInput.value = _timer.intervalMs / 1000 
    _elements.bankSelect.blur()
 }
// 重载：题库已存在，只刷新数据
async function reloadBank(bankName) {
  if(!quizEngines.get(bankName)){
    return
  }
  try {
    const freshEntries = await requestApi.fetchAllQuestionByBankName(bankName,sessionStorage.getItem('username'));
    quizEngines.get(bankName).setEntries(freshEntries)
    
  } catch (error) {
    console.error('reloadBank 失败：', error);
    return;
  }
}

// 新增：题库不存在，建引擎 + 加下拉框 + 切过去
async function addBank(bankName,username) {
  if (quizEngines.has(bankName)) {
    return reloadBank(bankName);   // 已存在，退化成重载
  }
  let freshEngine;
  try {
    const freshEntries = await requestApi.fetchAllQuestionByBankName(bankName,username);
    freshEngine = new QuizEngine(freshEntries);
    quizEngines.set(bankName, freshEngine);
    return freshEngine
  } catch (error) {
    showToast(`${error.message}`,'error')
    return;
  }
}

export const refreshBankList = async () => 
{ const bankNames = []
  try{
   bankNames.push(...(await requestApi.fetchAllBankName(sessionStorage.getItem('username'))));
  }catch(error){
    showToast(`${error.message}`,'error')
  }
  const fragment = document.createDocumentFragment();
  for (const bankName of bankNames) {

    const option = document.createElement('option');
    option.value = bankName;
    option.textContent = bankName;
    fragment.appendChild(option);
  }

  _elements.bankSelect.replaceChildren(fragment); 
  await addBank(bankNames[0],undefined)
  for(let i =1;i<bankNames.length;i++){
    addBank(bankNames[i],sessionStorage.getItem('username'))
  }
};

export { controller , reloadBank, addBank}