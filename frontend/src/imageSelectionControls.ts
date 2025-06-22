// Declare external functions used in this module
declare function updateResults(): void;
declare function requestExternalImage(url: string): Promise<HTMLImageElement>;
declare function renderSelectList(selectListId: string, onChange: (value: string) => void, initialValue: string, renderChildren: (select: HTMLSelectElement) => void): void;
declare function renderOption(parent: HTMLElement, text: string, value: string): void;

async function onSelectedImageChanged(uri: string): Promise<void> {
  const img = await faceapi.fetchImage(uri)
  const imgElement = $(`#inputImg`).get(0) as HTMLImageElement;
  if (imgElement) {
    imgElement.src = img.src;
  }
  updateResults()
}

async function loadImageFromUrl(url: string): Promise<void> {
  const urlInput = $('#imgUrlInput').val() as string;
  const img = await requestExternalImage(urlInput);
  const inputImg = $('#inputImg').get(0) as HTMLImageElement;
  if (inputImg) {
    inputImg.src = img.src;
  }
  updateResults()
}

async function loadImageFromUpload(): Promise<void> {
    const fileInput = $('#queryImgUploadInput').get(0) as HTMLInputElement;
    const imgFile = fileInput.files ? fileInput.files[0] : null;
    if (!imgFile) return;
    const img = await faceapi.bufferToImage(imgFile)
    const inputImg = $('#inputImg').get(0) as HTMLImageElement;
    if (inputImg) {
      inputImg.src = img.src;
    }
    updateResults()
}

function renderImageSelectList(selectListId: string, onChange: (value: string) => void, initialValue: string, withFaceExpressionImages: boolean): void {
  let images = [1, 2, 3, 4, 5].map(idx => `bbt${idx}.jpg`)

  if (withFaceExpressionImages) {
    images = [
      'happy.jpg',
      'sad.jpg',
      'angry.jpg',
      'disgusted.jpg',
      'surprised.jpg',
      'fearful.jpg',
      'neutral.jpg'
    ].concat(images)
  }

  function renderChildren(select: HTMLSelectElement): void {
    images.forEach(imageName =>
      renderOption(
        select,
        imageName,
        imageName
      )
    )
  }

  renderSelectList(
    selectListId,
    onChange,
    initialValue,
    renderChildren
  )
}

function initImageSelectionControls(initialValue: string = 'bbt1.jpg', withFaceExpressionImages: boolean = false): void {
  renderImageSelectList(
    '#selectList',
    async (uri: string) => {
      await onSelectedImageChanged(uri)
    },
    initialValue,
    withFaceExpressionImages
  )
  const selectValue = $('#selectList select').val() as string;
  if (selectValue) {
    onSelectedImageChanged(selectValue);
  }
} 