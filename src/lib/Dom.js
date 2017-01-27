/**
 * Façade Pattern
 * Responsible for DOM Manipulation
 */

export default class Dom {

  createDomElement(HTMLString,id,value) {
    let ele =document.createElement(HTMLString)
    if(id!=undefined)ele.id=id;
    if(value!=undefined)ele.innerHTML=value
    return ele;
  }

  append(parent, ...children) {
    children.forEach(function (child) {
      parent.appendChild(child)
    })
    return parent;
  }

  css(element, property, value) {
    if (property=='checked'){
      value || element.checked
    }else{
      element.setAttribute(property,value);
    }

    return element;
  }

  click(element, callback) {
    element.addEventListener("click",callback,true)
  }

}
