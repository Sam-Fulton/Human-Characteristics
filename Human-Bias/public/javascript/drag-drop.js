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
    const touchedElement = event.target.closest('[data-index]');
    const touchedIndex = touchedElement ? touchedElement.dataset.index : null;
  
    if (touchedIndex) {
      const touch = event.touches[0];
      touchedElement.initialTouchX = touch.pageX;
      touchedElement.initialTouchY = touch.pageY;
  
      event.target.addEventListener('touchmove', touchMove);
      event.target.addEventListener('touchend', touchEnd);
  
      function touchMove(moveEvent) {
        moveEvent.preventDefault();
        const touch = moveEvent.touches[0];
  
        const deltaX = touch.pageX - touchedElement.initialTouchX;
        const deltaY = touch.pageY - touchedElement.initialTouchY;
  
        touchedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      }
  
      function touchEnd(endEvent) {
        endEvent.preventDefault();
        const releasedElement = document.elementFromPoint(endEvent.changedTouches[0].clientX, endEvent.changedTouches[0].clientY);
        const releasedIndex = releasedElement ? releasedElement.dataset.index : null;
  
        console.log("RELEASED INDEX :" + releasedIndex);
        console.log("touchedIndex : " + touchedIndex);
  
        if (releasedIndex && touchedIndex) {
          const draggedImage = document.querySelector(`[data-index="${touchedIndex}"]`);
          const droppedImage = document.querySelector(`[data-index="${releasedIndex}"]`);
  
          if (draggedImage && droppedImage) {
            const parent = draggedImage.parentNode;
  
            const temp = document.createElement('div');
            parent.insertBefore(temp, draggedImage);
            parent.insertBefore(draggedImage, droppedImage);
            parent.insertBefore(droppedImage, temp);
            parent.removeChild(temp);
  
            draggedImage.dataset.index = releasedIndex;
            droppedImage.dataset.index = touchedIndex;
          }
        }
  
        touchedElement.style.transform = '';
  
        event.target.removeEventListener('touchmove', touchMove);
        event.target.removeEventListener('touchend', touchEnd);
      }
    }
  }
  
  function addDragDropListeners(element) {
    element.draggable = true;
    element.ondragstart = dragStart;
    element.ontouchstart = touchStart
  }
  