import {createSpacer} from './cta';

export {createCta, createSpacer} from './cta'
export {createTextSpan} from './text'

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
]

export class UIContainer{
    readonly canva: HTMLDivElement;
    readonly inner: HTMLDivElement;
    readonly container: HTMLDivElement;
    readonly history: HTMLDivElement;
    readonly ctas: HTMLDivElement[] = []

    constructor(){
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
        this.container = document.createElement('div')
        this.container.setAttribute('style', ctaContainerStyles.join(''));
        this.inner.appendChild(this.container);        
    }

    makeItDraggable(){
        let posX = 0,
            posY = 0,
            mouseX = 0,
            mouseY = 0;

        const moveElement = (e: MouseEvent) => {
            mouseX = e.clientX - posX;
            mouseY = e.clientY - posY;

            // Change right and bottom position
            this.inner.style.right = window.innerWidth - mouseX - this.inner.offsetWidth + "px";
            this.inner.style.bottom = window.innerHeight - mouseY - this.inner.offsetHeight + 'px';
        }

        const mouseDown = (e: MouseEvent) => {
            e.preventDefault();
            posX = e.clientX - this.inner.offsetLeft;
            posY = e.clientY - this.inner.offsetTop;
            window.addEventListener('mousemove', moveElement, false);
        }

        const mouseUp = () => {
            window.removeEventListener('mousemove', moveElement, false);
        }
        
        this.inner.addEventListener('mousedown', mouseDown, false);
        window.addEventListener('mouseup', mouseUp, false);

        const draggableIcon = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="18px" width="18px" xmlns="http://www.w3.org/2000/svg"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>`
        const draggableIconElem = document.createElement('div');
        draggableIconElem.style.cursor = "move";
        
        draggableIconElem.innerHTML = draggableIcon
        this.addCta(
            createSpacer()
        )
        this.addCta(
            draggableIconElem
        )
    }

    render(){
        document.body.appendChild(this.canva);
    }

    // CTA
    addCta(
        cta: HTMLDivElement,
        index?: number
    ){
        if(typeof(index)==="undefined"){
            this.ctas.push(cta)
        }else{
            this.ctas.splice(index, 0, cta)
        }
        // Render
        this.container.innerHTML = "";
        this.ctas.forEach((cta)=>{
            this.container.appendChild(cta);
        })
    }
}
