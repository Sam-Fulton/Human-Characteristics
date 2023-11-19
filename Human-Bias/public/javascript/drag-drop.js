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
    const touch = event.touches[0];
    const offsetX = touch.clientX - event.target.getBoundingClientRect().left;
    const offsetY = touch.clientY - event.target.getBoundingClientRect().top;
  
    event.preventDefault();
  
    event.target.style.position = 'absolute';
    event.target.style.zIndex = 1000;
    moveAt(touch.pageX - offsetX, touch.pageY - offsetY);
  
    function moveAt(pageX, pageY) {
      event.target.style.left = pageX - event.target.offsetWidth / 2 + 'px';
      event.target.style.top = pageY - event.target.offsetHeight / 2 + 'px';
    }
  
    function onTouchMove(moveEvent) {
      const touch = moveEvent.touches[0];
      moveAt(touch.pageX - offsetX, touch.pageY - offsetY);
    }
  
    function onTouchEnd() {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    }
  
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  }
  
  function addDragDropListeners(element) {
    element.draggable = true;
    element.ondragstart = dragStart;
    element.ontouchstart = touchStart
  }
  