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

    console.log("TOUCHED INDEX: " + touchedIndex);

    event.target.addEventListener('touchmove', touchMove, { once: true });

    function touchMove(moveEvent) {
      moveEvent.preventDefault();
      const draggedIndex = touchedIndex;
  
      const touch = moveEvent.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
  
      const elementsAtTouch = document.elementsFromPoint(x, y).filter(
          element => element !== event.target
      );
      console.log(elementsAtTouch);
    
  
      const dropTarget = elementsAtTouch.find(
          element => element.dataset && element.dataset.index
      );
        console.log("DROP TARGET: " + dropTarget);
    
        if (dropTarget) {
          const droppedIndex = dropTarget.dataset.index;
          console.log("DROPPED INDEX " + droppedIndex);
          
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
  
      document.removeEventListener('touchmove', touchMove);
  }
}
  
  function addDragDropListeners(element) {
    element.draggable = true;
    element.ondragstart = dragStart;
    element.ontouchstart = touchStart
  }
  