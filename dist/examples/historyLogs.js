import { ListStorage, initCanva, createBtn, createTextSpan } from '../src/index';
class ExempleStorage extends ListStorage {
    get headers() {
        return [
            'Name',
            'URL'
        ];
    }
    itemToRow(item) {
        return [
            item.name,
            item.url
        ];
    }
}
const elemStore = new ExempleStorage({
    name: "example-store"
});
const counterId = 'example-number-tracker';
function buildCTABtn() {
    const btnContainer = initCanva();
    // Button Download
    const btnDownload = createBtn();
    btnDownload.appendChild(createTextSpan('Download\u00A0'));
    btnDownload.appendChild(createTextSpan('0', counterId));
    btnDownload.appendChild(createTextSpan('\u00A0users'));
    btnContainer.appendChild(btnDownload);
}
buildCTABtn();
