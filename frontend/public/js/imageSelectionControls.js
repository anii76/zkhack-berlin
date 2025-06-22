"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function onSelectedImageChanged(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const img = yield faceapi.fetchImage(uri);
        $(`#inputImg`).get(0).src = img.src;
        updateResults();
    });
}
function loadImageFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const img = yield requestExternalImage($('#imgUrlInput').val());
        $('#inputImg').get(0).src = img.src;
        updateResults();
    });
}
function loadImageFromUpload() {
    return __awaiter(this, void 0, void 0, function* () {
        const imgFile = $('#queryImgUploadInput').get(0).files[0];
        const img = yield faceapi.bufferToImage(imgFile);
        $('#inputImg').get(0).src = img.src;
        updateResults();
    });
}
function renderImageSelectList(selectListId, onChange, initialValue, withFaceExpressionImages) {
    let images = [1, 2, 3, 4, 5].map(idx => `bbt${idx}.jpg`);
    if (withFaceExpressionImages) {
        images = [
            'happy.jpg',
            'sad.jpg',
            'angry.jpg',
            'disgusted.jpg',
            'surprised.jpg',
            'fearful.jpg',
            'neutral.jpg'
        ].concat(images);
    }
    function renderChildren(select) {
        images.forEach(imageName => renderOption(select, imageName, imageName));
    }
    renderSelectList(selectListId, onChange, initialValue, renderChildren);
}
function initImageSelectionControls(initialValue = 'bbt1.jpg', withFaceExpressionImages = false) {
    renderImageSelectList('#selectList', (uri) => __awaiter(this, void 0, void 0, function* () {
        yield onSelectedImageChanged(uri);
    }), initialValue, withFaceExpressionImages);
    onSelectedImageChanged($('#selectList select').val());
}
