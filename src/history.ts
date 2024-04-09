

interface HistoryLog {
    index: number
    createdAt: Date
    label: string
    groupId: string
    numberItems: number
    cancellable: boolean
}

const historyPanelStyles = [
    "text-align: right;",
    "background: #f5f5fa;",
    "padding: 8px;",
    "margin-bottom: 8px;",
    "border-radius: 8px;",
    "font-family: monospace;",
    "font-size: 16px;",
    "box-shadow: rgba(42, 35, 66, 0.2) 0 2px 2px,rgba(45, 35, 66, 0.2) 0 7px 13px -4px;",
    "color: #2f2f2f;"
]

const historyUlStyles = [
    "list-style: none;",
    "margin: 0;"
]

const historyLiStyles = [
    "line-height: 30px;",
    "display: flex;",
    "align-items: center;",
    "justify-content: right;"
]

const deleteIconStyles = [
    "display: flex;",
    "align-items: center;",
    "padding: 4px 12px;",
    "cursor: pointer;",
]

const deleteIconSvg: string = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

export class HistoryTracker {
    readonly onDelete: (groupId: string) => Promise<void>
    readonly maxLogs: number = 5;
    readonly container: HTMLElement;

    logs: HistoryLog[] = [];
    panelRef: HTMLDivElement | null = null;
    counter: number = 0;

    constructor({
        onDelete,
        divContainer,
        maxLogs
    }: {
        onDelete: (groupId: string) => Promise<void>,
        divContainer: HTMLDivElement
        maxLogs?: number
    }){
        this.onDelete = onDelete;
        this.container = divContainer;
        if(maxLogs){
            this.maxLogs = maxLogs;
        }
    }

    renderPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.setAttribute('style', historyPanelStyles.join(''));
        return panel;
    }

    renderLogs(){
        if(this.panelRef){
            this.panelRef.remove();
        }
        if(this.logs.length===0) return;

        const listOutter = document.createElement('ul');
        listOutter.setAttribute('style', historyUlStyles.join(''));
        
        this.logs.forEach(log=>{
            const listElem = document.createElement('li');
            listElem.setAttribute('style', historyLiStyles.join(''));

            listElem.innerHTML = `<div>#${log.index} ${log.label} (${log.numberItems})</div>`;

            if(log.cancellable){
                // Add delete icon
                const deleteIcon = document.createElement('div');
                deleteIcon.setAttribute('style', deleteIconStyles.join(''));
                deleteIcon.innerHTML = deleteIconSvg;
                deleteIcon.addEventListener('click', async () => {
                    await this.onDelete(log.groupId);
                    const logIndex = this.logs.findIndex((loopLog)=> loopLog.index === log.index);
                    if(logIndex !== -1){
                        this.logs.splice(logIndex, 1);
                        this.renderLogs();
                    }
    
                });
                listElem.append(deleteIcon)
            }

            listOutter.prepend(listElem);
        })

        const panel = this.renderPanel();
        panel.appendChild(listOutter)

        this.panelRef = panel;
        this.container.appendChild(panel)
    }

    addHistoryLog({
        label,
        groupId,
        numberItems,
        cancellable
    }: {
        label: string
        groupId: string
        numberItems: number
        cancellable: boolean
    }){
        this.counter += 1;
        const log: HistoryLog = {
            index: this.counter,
            label,
            groupId,
            numberItems,
            cancellable,
            createdAt: new Date()
        }
        this.logs.unshift(log)
        if(this.logs.length>this.maxLogs){
            this.logs.splice(this.maxLogs)
        }
        
        this.renderLogs();
    }
    cleanLogs(){
        this.logs = [];
        this.counter = 0;
        this.renderLogs();
    }
}

