export function createTextSpan(content, idAttribute) {
    const span = document.createElement("span");
    if (idAttribute) {
        span.setAttribute('id', idAttribute);
    }
    span.textContent = content;
    return span;
}
export function createBtn(borderLeft) {
    const btn = document.createElement('div');
    const btnStyles = [
        'display: block;',
        'padding: 0px 4px;'
    ];
    if (borderLeft) {
        btnStyles.push(...[
            'border-left: 1px solid #2e2e2e;',
            'margin-left: 4px;'
        ]);
    }
    btn.setAttribute('style', btnStyles.join(''));
    return btn;
}
function createInner() {
    const inner = document.createElement('div');
    const innerStyles = [
        'position: absolute;',
        'bottom: 30px;',
        'right: 130px;',
        'color: #2e2e2e;',
        'background: #EEE;',
        'border-radius: 12px;',
        'padding: 0px 12px;',
        'cursor: pointer;',
        'font-weight:600;',
        'font-size:15px;',
        'display: flex;',
        'pointer-events: auto;',
        'border: 1px solid #000;',
        'height: 36px;',
        'align-items: center;',
        'justify-content: center;'
    ];
    inner.setAttribute('style', innerStyles.join(''));
    return inner;
}
export function initCanva() {
    const canva = document.createElement('div');
    const canvasStyles = [
        'position: fixed;',
        'top: 0;',
        'left: 0;',
        'z-index: 10;',
        'width: 100%;',
        'height: 100%;',
        'pointer-events: none;'
    ];
    canva.setAttribute('style', canvasStyles.join(''));
    const inner = createInner();
    canva.appendChild(inner);
    document.body.appendChild(canva);
    return inner;
}
