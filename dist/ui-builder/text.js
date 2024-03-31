export function createTextSpan(content, options) {
    const optionsClean = options || {};
    let textElem;
    const span = document.createElement("span");
    if (optionsClean.bold) {
        const strong = document.createElement("strong");
        span.append(strong);
        textElem = strong;
    }
    else {
        textElem = span;
    }
    textElem.textContent = content;
    if (optionsClean.idAttribute) {
        textElem.setAttribute('id', optionsClean.idAttribute);
    }
    return span;
}
