export function createTextSpan(content, idAttribute) {
    const span = document.createElement("span");
    if (idAttribute) {
        span.setAttribute('id', idAttribute);
    }
    span.textContent = content;
    return span;
}
