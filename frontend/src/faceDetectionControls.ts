// Declare external function used in this module
declare function updateResults(): void;

const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'


let selectedFaceDetector = SSD_MOBILENETV1

// ssd_mobilenetv1 options
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5

function getFaceDetectorOptions(): any {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

function onIncreaseMinConfidence(): void {
  minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 1.0)
  $('#minConfidence').val(minConfidence)
  updateResults()
}

function onDecreaseMinConfidence(): void {
  minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1)
  $('#minConfidence').val(minConfidence)
  updateResults()
}

function onInputSizeChanged(e: Event): void {
  changeInputSize((e.target as HTMLInputElement).value)
  updateResults()
}

function changeInputSize(size: string): void {
  inputSize = parseInt(size)

  const inputSizeSelect = $('#inputSize')
  inputSizeSelect.val(inputSize)
  inputSizeSelect.material_select()
}

function onIncreaseScoreThreshold(): void {
  scoreThreshold = Math.min(faceapi.utils.round(scoreThreshold + 0.1), 1.0)
  $('#scoreThreshold').val(scoreThreshold)
  updateResults()
}

function onDecreaseScoreThreshold(): void {
  scoreThreshold = Math.max(faceapi.utils.round(scoreThreshold - 0.1), 0.1)
  $('#scoreThreshold').val(scoreThreshold)
  updateResults()
}

// Add missing minFaceSize variable
let minFaceSize = 150;

function onIncreaseMinFaceSize(): void {
  minFaceSize = Math.min(faceapi.utils.round(minFaceSize + 20), 300)
  $('#minFaceSize').val(minFaceSize)
}

function onDecreaseMinFaceSize(): void {
  minFaceSize = Math.max(faceapi.utils.round(minFaceSize - 20), 50)
  $('#minFaceSize').val(minFaceSize)
}

function getCurrentFaceDetectionNet(): any {
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return faceapi.nets.ssdMobilenetv1
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return faceapi.nets.tinyFaceDetector
  }
}

function isFaceDetectionModelLoaded(): boolean {
  return !!getCurrentFaceDetectionNet().params
}

async function changeFaceDetector(detector: string): Promise<void> {
  ['#ssd_mobilenetv1_controls', '#tiny_face_detector_controls']
    .forEach(id => $(id).hide())

  selectedFaceDetector = detector
  const faceDetectorSelect = $('#selectFaceDetector')
  faceDetectorSelect.val(detector)
  faceDetectorSelect.material_select()

  $('#loader').show()
  if (!isFaceDetectionModelLoaded()) {
    await getCurrentFaceDetectionNet().load('/')
  }

  $(`#${detector}_controls`).show()
  $('#loader').hide()
}

async function onSelectedFaceDetectorChanged(e: Event): Promise<void> {
  selectedFaceDetector = (e.target as HTMLSelectElement).value

  await changeFaceDetector((e.target as HTMLSelectElement).value)
  updateResults()
}

function initFaceDetectionControls(): void {
  const faceDetectorSelect = $('#selectFaceDetector')
  faceDetectorSelect.val(selectedFaceDetector)
  faceDetectorSelect.on('change', onSelectedFaceDetectorChanged)
  faceDetectorSelect.material_select()

  const inputSizeSelect = $('#inputSize')
  inputSizeSelect.val(inputSize)
  inputSizeSelect.on('change', onInputSizeChanged)
  inputSizeSelect.material_select()
} 