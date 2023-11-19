function dragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.index);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const draggedIndex = event.dataTransfer.getData('text/plain');
  const droppedIndex = event.target.dataset.index;

  if (draggedIndex !== droppedIndex) {
    const draggedImage = document.querySelector(`[data-index="${draggedIndex}"]`);
    const droppedImage = document.querySelector(`[data-index="${droppedIndex}"]`);

    if (draggedImage && droppedImage) {
      const parent = draggedImage.parentNode;

      const temp = document.createElement('div');
      parent.insertBefore(temp, draggedImage);
      parent.insertBefore(draggedImage, droppedImage);
      parent.insertBefore(droppedImage, temp);
      parent.removeChild(temp);

      draggedImage.dataset.index = droppedIndex;
      droppedImage.dataset.index = draggedIndex;
    }
  }
}

function touchStart(event) {
  event.preventDefault();
  const touchedIndex = event.target.dataset.index;

  event.target.addEventListener('touchmove', (moveEvent) => touchMove(moveEvent, touchedIndex));
  event.target.addEventListener('touchend', touchEnd, { once: true });
}

function touchMove(moveEvent, touchedIndex) {
  moveEvent.preventDefault();
}

function touchEnd(event) {
  event.preventDefault();

  const touch = event.changedTouches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  const draggedIndex = event.target.dataset.index;

  const draggedImage = document.querySelector(`[data-index="${draggedIndex}"]`);
  const rankSvgDiv = draggedImage.closest('.rank-svg');
  const images = Array.from(rankSvgDiv.querySelectorAll('embed'));


  let dropTarget;

  for (const image of images) {
    if (image !== draggedImage) {
      const rect = image.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        dropTarget = image;
        break;
      }
    }
  }

  if (dropTarget) {
    const droppedIndex = dropTarget.dataset.index;

    const parent = draggedImage.parentNode;

    const temp = document.createElement('div');
    parent.insertBefore(temp, draggedImage);
    parent.insertBefore(draggedImage, dropTarget);
    parent.insertBefore(dropTarget, temp);
    parent.removeChild(temp);

    draggedImage.dataset.index = droppedIndex;
    dropTarget.dataset.index = draggedIndex;

  } 
}

function addDragDropListeners(element) {
  element.draggable = true;
  element.ondragstart = dragStart;
  element.ondragover = allowDrop;
  element.ondrop = drop;
  element.ontouchstart = touchStart;
}
