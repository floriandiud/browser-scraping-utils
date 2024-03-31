
const btnStyles: string = `
    display: block;
    padding: 0px 4px;
    cursor: pointer;
    text-align: center;
`;

export function createCta(
    main?: boolean
): HTMLDivElement {
    const btn = document.createElement('div');
    let styles = btnStyles;
    if(main){
        styles += 'flex-grow: 1;'
    }
    btn.setAttribute('style', styles);
    return btn
}

const spacerStyles: string = `
    margin-left: 4px;
    margin-right: 4px;
    border-left: 1px solid #2e2e2e;
`;

export function createSpacer(){
    const spacer = document.createElement('div');
    spacer.innerHTML = "&nbsp;";
    spacer.setAttribute('style', spacerStyles);
    return spacer;
}
