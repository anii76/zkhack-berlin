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
const SSD_MOBILENETV1 = 'ssd_mobilenetv1';
const TINY_FACE_DETECTOR = 'tiny_face_detector';
let selectedFaceDetector = SSD_MOBILENETV1;
// ssd_mobilenetv1 options
let minConfidence = 0.5;
// tiny_face_detector options
let inputSize = 512;
let scoreThreshold = 0.5;
function getFaceDetectorOptions() {
    return selectedFaceDetector === SSD_MOBILENETV1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}
function onIncreaseMinConfidence() {
    minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 1.0);
    $('#minConfidence').val(minConfidence);
    updateResults();
}
function onDecreaseMinConfidence() {
    minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1);
    $('#minConfidence').val(minConfidence);
    updateResults();
}
function onInputSizeChanged(e) {
    changeInputSize(e.target.value);
    updateResults();
}
function changeInputSize(size) {
    inputSize = parseInt(size);
    const inputSizeSelect = $('#inputSize');
    inputSizeSelect.val(inputSize);
    inputSizeSelect.material_select();
}
function onIncreaseScoreThreshold() {
    scoreThreshold = Math.min(faceapi.utils.round(scoreThreshold + 0.1), 1.0);
    $('#scoreThreshold').val(scoreThreshold);
    updateResults();
}
function onDecreaseScoreThreshold() {
    scoreThreshold = Math.max(faceapi.utils.round(scoreThreshold - 0.1), 0.1);
    $('#scoreThreshold').val(scoreThreshold);
    updateResults();
}
function onIncreaseMinFaceSize() {
    minFaceSize = Math.min(faceapi.utils.round(minFaceSize + 20), 300);
    $('#minFaceSize').val(minFaceSize);
}
function onDecreaseMinFaceSize() {
    minFaceSize = Math.max(faceapi.utils.round(minFaceSize - 20), 50);
    $('#minFaceSize').val(minFaceSize);
}
function getCurrentFaceDetectionNet() {
    if (selectedFaceDetector === SSD_MOBILENETV1) {
        return faceapi.nets.ssdMobilenetv1;
    }
    if (selectedFaceDetector === TINY_FACE_DETECTOR) {
        return faceapi.nets.tinyFaceDetector;
    }
}
function isFaceDetectionModelLoaded() {
    return !!getCurrentFaceDetectionNet().params;
}
function changeFaceDetector(detector) {
    return __awaiter(this, void 0, void 0, function* () {
        ['#ssd_mobilenetv1_controls', '#tiny_face_detector_controls']
            .forEach(id => $(id).hide());
        selectedFaceDetector = detector;
        const faceDetectorSelect = $('#selectFaceDetector');
        faceDetectorSelect.val(detector);
        faceDetectorSelect.material_select();
        $('#loader').show();
        if (!isFaceDetectionModelLoaded()) {
            yield getCurrentFaceDetectionNet().load('/');
        }
        $(`#${detector}_controls`).show();
        $('#loader').hide();
    });
}
function onSelectedFaceDetectorChanged(e) {
    return __awaiter(this, void 0, void 0, function* () {
        selectedFaceDetector = e.target.value;
        yield changeFaceDetector(e.target.value);
        updateResults();
    });
}
function initFaceDetectionControls() {
    const faceDetectorSelect = $('#selectFaceDetector');
    faceDetectorSelect.val(selectedFaceDetector);
    faceDetectorSelect.on('change', onSelectedFaceDetectorChanged);
    faceDetectorSelect.material_select();
    const inputSizeSelect = $('#inputSize');
    inputSizeSelect.val(inputSize);
    inputSizeSelect.on('change', onInputSizeChanged);
    inputSizeSelect.material_select();
}
