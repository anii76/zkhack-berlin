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
const classes = ['amy', 'bernadette', 'howard', 'leonard', 'penny', 'raj', 'sheldon', 'stuart'];
function getFaceImageUri(className, idx) {
    return `${className}/${className}${idx}.png`;
}
function renderFaceImageSelectList(selectListId, onChange, initialValue) {
    const indices = [1, 2, 3, 4, 5];
    function renderChildren(select) {
        classes.forEach(className => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = className;
            select.appendChild(optgroup);
            indices.forEach(imageIdx => renderOption(optgroup, `${className} ${imageIdx}`, getFaceImageUri(className, imageIdx)));
        });
    }
    renderSelectList(selectListId, onChange, getFaceImageUri(initialValue.className, initialValue.imageIdx), renderChildren);
}
// fetch first image of each class and compute their descriptors
function createBbtFaceMatcher() {
    return __awaiter(this, arguments, void 0, function* (numImagesForTraining = 1) {
        const maxAvailableImagesPerClass = 5;
        numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass);
        const labeledFaceDescriptors = yield Promise.all(classes.map((className) => __awaiter(this, void 0, void 0, function* () {
            const descriptors = [];
            for (let i = 1; i < (numImagesForTraining + 1); i++) {
                const img = yield faceapi.fetchImage(getFaceImageUri(className, i));
                descriptors.push(yield faceapi.computeFaceDescriptor(img));
            }
            return new faceapi.LabeledFaceDescriptors(className, descriptors);
        })));
        return new faceapi.FaceMatcher(labeledFaceDescriptors);
    });
}
