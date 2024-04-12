export { createCta, createSpacer } from './cta';
export { createTextSpan } from './text';
export declare class UIContainer {
    readonly canva: HTMLDivElement;
    readonly inner: HTMLDivElement;
    readonly container: HTMLDivElement;
    readonly history: HTMLDivElement;
    readonly ctas: HTMLDivElement[];
    constructor();
    makeItDraggable(): void;
    render(): void;
    addCta(cta: HTMLDivElement, index?: number): void;
}
