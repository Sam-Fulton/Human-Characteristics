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
  
    const touch = event.touches[0];
    event.target.initialTouchX = touch.pageX;
    event.target.initialTouchY = touch.pageY;
  
    event.target.addEventListener('touchmove', touchMove);
    event.target.addEventListener('touchend', touchEnd);
  
    function touchMove(moveEvent) {
      moveEvent.preventDefault();
      const touch = moveEvent.touches[0];
  
      const deltaX = touch.pageX - event.target.initialTouchX;
      const deltaY = touch.pageY - event.target.initialTouchY;
  
      event.target.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
  
    function touchEnd(endEvent) {
      endEvent.preventDefault();
      const releasedIndex = endEvent.target.dataset.index;
      console.log(releasedIndex);
  
      const draggedImage = document.querySelector(`[data-index="${touchedIndex}"]`);
      console.log("Dragged Image : " + draggedImage)
      const droppedImage = document.querySelector(`[data-index="${releasedIndex}"]`);
      console.log("Dropped Image" + droppedImage);

      if (draggedImage && droppedImage) {
        const parent = draggedImage.parentNode;
  
        const temp = document.createElement('div');
        parent.insertBefore(temp, draggedImage);
        parent.insertBefore(draggedImage, droppedImage);
        parent.insertBefore(droppedImage, temp);
        parent.removeChild(temp);
  
        draggedImage.dataset.index = releasedIndex;
        droppedImage.dataset.index = touchedIndex;

        console.log("RELEASED INDEX :" + releasedIndex);
        console.log("touchedIndex : " + touchedIndex);
      }
  
      event.target.style.transform = '';

      event.target.removeEventListener('touchmove', touchMove);
      event.target.removeEventListener('touchend', touchEnd);
    }
  }
  
  function addDragDropListeners(element) {
    element.draggable = true;
    element.ondragstart = dragStart;
    element.ontouchstart = touchStart
  }
  