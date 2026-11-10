


class View {
  #container
  #template
  constructor(container, template){
    this.#container = container
    this.#template = template
  }

  render(element){
    if(element){
      this.#container.replaceChildren(element)
      return element;
    }
    const fragment = this.#template.content.cloneNode(true)
    this.#container.replaceChildren(fragment)
    return fragment;
  }

  clear(){
    this.#container.replaceChildren();
  }
}

export {View}