function ImoinDomRenderer(element, props, ...children) {
    const el = document.createElement(element);
    if (props) {
        Object.keys(props).forEach(key => {
            el.setAttribute(key, props[key]);
        });
    }

    for (let child of children) {
        el.appendChild(
            child instanceof HTMLElement
            ? child
            : document.createTextNode(child)
        );
    }

    return el;
}

window.dom = ImoinDomRenderer;
