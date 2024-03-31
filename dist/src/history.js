export class HistoryTracker {
    constructor({ onDelete, divContainer, maxLogs }) {
        this.maxLogs = 5;
        this.logs = [];
        this.listRef = null;
        this.onDelete = onDelete;
        this.container = divContainer;
        if (maxLogs) {
            this.maxLogs = maxLogs;
        }
    }
    createHistoryPanel() {
        const panel = document.createElement('div');
        const panelStyles = [
            'display: block;',
            'background: white;',
            'padding: 0px 4px;'
        ];
        panel.setAttribute('style', panelStyles.join(''));
    }
    renderLogs() {
        console.log('RenderLogs');
        const listOutter = document.createElement('ul');
        this.logs.forEach(log => {
            const listElem = document.createElement('li');
            listElem.textContent = `${log.label} (${log.numberItems})`;
            listOutter.appendChild(listElem);
        });
        if (this.listRef) {
            this.listRef.remove();
        }
        this.listRef = listOutter;
        this.container.appendChild(listOutter);
    }
    addHistoryLog({ label, groupId, numberItems }) {
        console.log('Add Log');
        const log = {
            label,
            groupId,
            numberItems,
            createdAt: new Date()
        };
        this.logs.push(log);
        if (this.logs.length > this.maxLogs) {
            this.logs.splice(this.maxLogs);
        }
        this.renderLogs();
    }
}
