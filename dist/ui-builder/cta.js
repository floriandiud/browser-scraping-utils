const btnStyles = [
    "display: block;",
    "padding: 0px 4px;",
    "cursor: pointer;",
    "text-align: center;"
];
export function createCta(main) {
    const btn = document.createElement('div');
    const styles = [...btnStyles];
    if (main) {
        styles.push('flex-grow: 1;');
    }
    btn.setAttribute('style', styles.join(''));
    return btn;
}
const spacerStyles = [
    "margin-left: 4px;",
    "margin-right: 4px;",
    "border-left: 1px solid #2e2e2e;"
];
export function createSpacer() {
    const spacer = document.createElement('div');
    spacer.innerHTML = "&nbsp;";
    spacer.setAttribute('style', spacerStyles.join(''));
    return spacer;
}
