export { createCta, createSpacer } from './cta';
export { createTextSpan } from './text';
const canvasStyles = [
    'position: fixed;',
    'top: 0;',
    'left: 0;',
    'z-index: 10000;',
    'width: 100%;',
    'height: 100%;',
    'pointer-events: none;'
];
const innerStyles = [
    'position: absolute;',
    'bottom: 30px;',
    'right: 30px;',
    'width: auto;',
    'pointer-events: auto;',
];
const ctaContainerStyles = [
    "align-items: center;",
    "appearance: none;",
    "background-color: #EEE;",
    "border-radius: 4px;",
    "border-width: 0;",
    "box-shadow: rgba(45, 35, 66, 0.4) 0 2px 4px,rgba(45, 35, 66, 0.3) 0 7px 13px -3px,#D6D6E7 0 -3px 0 inset;",
    "box-sizing: border-box;",
    "color: #36395A;",
    "display: flex;",
    "font-family: monospace;",
    "height: 38px;",
    "justify-content: space-between;",
    "line-height: 1;",
    "list-style: none;",
    "overflow: hidden;",
    "padding-left: 16px;",
    "padding-right: 16px;",
    "position: relative;",
    "text-align: left;",
    "text-decoration: none;",
    "user-select: none;",
    "white-space: nowrap;",
    "font-size: 18px;"
];
export class UIContainer {
    constructor() {
        // <div id="canva">
        //     <div id="inner">
        //         <div id="history">
        //             <ul>
        //                 <li>XXX</li>
        //             </ul>
        //         </div>
        //         <div id="cta-container">
        //             <div class="cta-btn grow-1">
        //                 Download <span id="counter">XXX</span>
        //             </div>
        //             <div class="cta-spacer">
        //             &nbsp;
        //             </div>
        //             <div class="cta-btn border-left">
        //                 Reset
        //             </div>
        //         </div>
        //     </div>
        // </div>
        this.ctas = [];
        // Create Canva, a div that takes full screen
        this.canva = document.createElement('div');
        this.canva.setAttribute('style', canvasStyles.join(''));
        // Create an inner div. Positioned
        this.inner = document.createElement('div');
        this.inner.setAttribute('style', innerStyles.join(''));
        this.canva.appendChild(this.inner);
        // Create a div to store history logs
        this.history = document.createElement('div');
        this.inner.appendChild(this.history);
        // Create a container for the buttons
        this.container = document.createElement('div');
        this.container.setAttribute('style', ctaContainerStyles.join(''));
        this.inner.appendChild(this.container);
    }
    render() {
        document.body.appendChild(this.canva);
    }
    // CTA
    addCta(cta, index) {
        if (typeof (index) === "undefined") {
            this.ctas.push(cta);
        }
        else {
            this.ctas.splice(index, 0, cta);
        }
        // Render
        this.container.innerHTML = "";
        this.ctas.forEach((cta) => {
            this.container.appendChild(cta);
        });
    }
}
