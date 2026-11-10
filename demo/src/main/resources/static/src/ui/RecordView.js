// src/ui/RecordView.js
// 记录视图：负责把词条渲染到 DOM，不碰业务逻辑

export class RecordView {
  #template;
  #container;

  /**
   * @param {HTMLTemplateElement} template - 记录模板
   * @param {HTMLElement} container - 挂载容器
   */
  constructor(template, container) {
    if (!template?.content?.cloneNode) {
      throw new TypeError('template 必须是带 content.cloneNode 的模板元素');
    }
    if (!container?.replaceChildren) {
      throw new TypeError('container 必须是支持 replaceChildren 的元素');
    }
    this.#template = template;
    this.#container = container;
  }

  /**
   * 渲染一条词条，替换容器内容
   * @param {{question: string, answers: string[], desc: string, status: string}} entry
   * @returns {Node} 渲染出的 fragment
   */
  render(entry) {
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
    const record = fragment.querySelector('.record');
    if (!record) {
      throw new Error('模板缺少 .record 元素');
    }

    // 1. 问题
    const questionEl = record.querySelector('.record__question');
    if (questionEl) {
      questionEl.textContent = entry.question ?? '';
    }

    // 2. 描述（每条记录自己的描述，不再是全局角标）
    const descEl = record.querySelector('.record__description');
    if (descEl) {
      descEl.textContent = entry.desc ?? '';
    }

    // 3. 状态类：由数据驱动，不写死在模板
    record.classList.add(
      entry.status === 'mastered' ? 'record--mastered' : 'record--needs-mastery'
    );

    // 4. 答案：追加到 article.record 里，不是 fragment 后面
    const answers = Array.isArray(entry.answers) ? entry.answers : [];
    const templateAnswer = record.querySelector('.record__answer')
    templateAnswer?.remove()
    
    for (const answer of answers) {
      const el = templateAnswer.cloneNode(true);
      el.textContent = answer;
      record.insertBefore(el,descEl)
    }
    
    return fragment;
  }

  /** 清空容器 */
  clear() {
    this.#container.replaceChildren();
  }
}