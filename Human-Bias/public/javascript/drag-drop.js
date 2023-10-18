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
  
  function addDragDropListeners(element) {
    element.draggable = true;
    element.ondragstart = dragStart;
  }
  