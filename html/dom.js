function ImoinDomRenderer(element, props, ...children) {
    const el = document.createElement(element);
    if (props) {
        Object.keys(props).forEach(key => {
            el.setAttribute(key, props[key]);
        });
    }

    function appendChildren(children) {
        children.forEach(child => {
            if (Array.isArray(child)) {
                appendChildren(child);
                return;
            } 
            el.appendChild(
                child instanceof HTMLElement
                ? child
                : document.createTextNode(child)
            );
        })
    }

    appendChildren(children);

    return el;
}

window.dom = ImoinDomRenderer;
