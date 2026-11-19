


class View {
  #container
  #template
  constructor(container, template){
    this.#container = container
    this.#template = template
  }

  renderHtmlElement(htmlElement){
    this.#container.replaceChildren(htmlElement)
  }

  clear(){
    this.#container.replaceChildren();
  }
  appendHtmlElement(...htmlElements){
    this.#container.append(...htmlElements)
  }
  replaceAllHtmlElementFor(...htmlElements){
    this.#container.replaceChildren(...htmlElements)
  }
  renderHidden(){
    this.#container.style.visibility = 'hidden'
  }
  renderVisible(){
    this.#container.style.visibility = 'visible'
  }
  render(){
    this.#container.replaceChildren(this.#template.content.cloneNode(true))
  }
  
}

export {View}