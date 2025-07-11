const classes = ['amy', 'bernadette', 'howard', 'leonard', 'penny', 'raj', 'sheldon', 'stuart']

function getFaceImageUri(className: string, idx: number): string {
  return `${className}/${className}${idx}.png`
}

function renderFaceImageSelectList(selectListId: string, onChange: (value: string) => void, initialValue: { className: string; imageIdx: number }): void {
  const indices = [1, 2, 3, 4, 5]
  function renderChildren(select: HTMLSelectElement): void {
    classes.forEach(className => {
      const optgroup = document.createElement('optgroup')
      optgroup.label = className
      select.appendChild(optgroup)
      indices.forEach(imageIdx =>
        renderOption(
          optgroup,
          `${className} ${imageIdx}`,
          getFaceImageUri(className, imageIdx)
        )
      )
    })
  }

  renderSelectList(
    selectListId,
    onChange,
    getFaceImageUri(initialValue.className, initialValue.imageIdx),
    renderChildren
  )
}

// fetch first image of each class and compute their descriptors
async function createBbtFaceMatcher(numImagesForTraining: number = 1): Promise<any> {
  const maxAvailableImagesPerClass = 5
  numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass)

  const labeledFaceDescriptors = await Promise.all(classes.map(
    async className => {
      const descriptors = []
      for (let i = 1; i < (numImagesForTraining + 1); i++) {
        const img = await faceapi.fetchImage(getFaceImageUri(className, i))
        descriptors.push(await faceapi.computeFaceDescriptor(img))
      }

      return new faceapi.LabeledFaceDescriptors(
        className,
        descriptors
      )
    }
  ))

  return new faceapi.FaceMatcher(labeledFaceDescriptors)
} 