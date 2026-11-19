// src/ui/RecordView.js
// 记录视图：负责把词条渲染到 DOM，不碰业务逻辑
import { View } from './View.js';
export class RecordView extends View {
  #container;
  #template;
  

  /**
   * @param {HTMLTemplateElement} template - 记录模板
   * @param {HTMLElement} container - 挂载容器
   */
  constructor(container, template) {
    if (!template?.content?.cloneNode) {
      throw new TypeError('template 必须是带 content.cloneNode 的模板元素');
    }
    if (!container?.replaceChildren) {
      throw new TypeError('container 必须是支持 replaceChildren 的元素');
    }
    super(container);
    this.#container = container;
    this.#template = template;
  }

  /**
   * 渲染一条词条，替换容器内容
   * @param {{question: string, answers: string[], desc: string, status: string}} entry
   * @returns {Node} 渲染出的 fragment
   */
  renderEntry(entry) {
    this.#container.classList.remove('log-book__content--empty')
    const fragment = this.createRecordElement(entry);
    
    this.#container.replaceChildren(fragment);
    
    return fragment;
  }

  /**
   * 只创建记录元素，不挂载
   * @param {{question: string, answers: string[], desc: string, status: string}} entry
   * @returns {DocumentFragment}
   */
  createRecordElement(entry) {
    const fragment = this.#template.content.cloneNode(true);
    const recordEl = fragment.querySelector('.record');
    if (!recordEl) {
      throw new Error('模板缺少 .record 元素');
    }

    // 1. 问题
    const questionEl = recordEl.querySelector('.record__question');
    if (questionEl) {
      questionEl.textContent = entry.question ?? '';
    }

    // 2. 描述（每条记录自己的描述，不再是全局角标）
    const descEl = recordEl.querySelector('.record__description');
    if (descEl) {
      descEl.textContent = entry.desc ?? '';
    }

    // 4. 答案：追加到 article.recordEl 里，不是 fragment 后面
    const answers = Array.isArray(entry.answers) ? entry.answers : [];
    const templateAnswer = recordEl.querySelector('.record__answer')
    templateAnswer?.remove()
    
    for (const answer of answers) {
      const el = templateAnswer.cloneNode(true);
      el.textContent = answer;
      recordEl.insertBefore(el,descEl)
    }
    
    return fragment;
  }

  renderEmpty(){
    this.#container.classList.add('log-book__content--empty')
  }

}