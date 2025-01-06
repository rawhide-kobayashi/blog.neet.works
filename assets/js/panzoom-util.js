// AI GENNED AS FUCK NGL

// Define the handler variables outside of any event listener
let activeContainer = null;
let panzoomInstance = null;
let isProcessingClick = false;
let isInitialized = false;  // Add a flag to prevent multiple initializations

// Handle keyboard events
function handleKeyPress(e) {
  if (e.key === "Escape" && activeContainer) {
    closePopup();
  }
}

// Function to close the popup and cleanup
function closePopup() {
  if (activeContainer) {
    // Remove the keyboard event listener
    document.removeEventListener("keydown", handleKeyPress);
    
    // Clean up Panzoom instance
    if (panzoomInstance && typeof panzoomInstance.destroy === 'function') {
      panzoomInstance.destroy();
    }
    
    activeContainer.remove();
    activeContainer = null;
    panzoomInstance = null;
    isProcessingClick = false;
  }
}

// Initialize the panzoom functionality
function initializePanzoom() {
  if (isInitialized) return;  // Prevent multiple initializations
  
  // Create a single delegated click handler at the document level
  document.body.addEventListener('click', function(event) {
    // First, check if we clicked a zoomable image
    const clickedImage = event.target.closest('.zoomable');
    if (!clickedImage) return;  // Exit if we didn't click a zoomable image
    
    event.preventDefault();
    event.stopPropagation();  // Stop event from bubbling
    
    // If there's already a container or we're processing a click, don't create another
    if (activeContainer || isProcessingClick) {
      console.log('Already processing or container exists');  // Debug log
      return;
    }

    isProcessingClick = true;

    // Create the popup container
    activeContainer = document.createElement("div");
    activeContainer.className = "panzoom-popup";
    
    // Use the clicked image's source and alt
    const imgSrc = clickedImage.dataset.src || clickedImage.src;
    const imgAlt = clickedImage.alt || '';
    
    activeContainer.innerHTML = `
      <div class="panzoom-overlay">
        <img src="${imgSrc}" alt="${imgAlt}" />
      </div>
    `;
    
    document.body.appendChild(activeContainer);

    // Initialize Panzoom on the image
    const popupImage = activeContainer.querySelector("img");
    
    // Wait for the image to load before initializing Panzoom
    popupImage.onload = () => {
      // Get the image and viewport dimensions
      const imageWidth = popupImage.naturalWidth;
      const imageHeight = popupImage.naturalHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate the scaling factor to fit the image within the viewport
      const scaleX = viewportWidth / imageWidth;
      const scaleY = viewportHeight / imageHeight;

      // Use the smaller scaling factor to ensure the image fits within the viewport
      const scale = Math.min(scaleX, scaleY);

      // Calculate the initial x and y coordinates to center the image after scaling
      const startX = (viewportWidth - imageWidth * scale) / 2;
      const startY = (viewportHeight - imageHeight * scale) / 2;

      console.log(startX, startY, imageWidth, imageHeight, viewportWidth, viewportHeight)

      // But only modifying y is necessary because centering works VIA CESSPOOL HORIZONTALLY BUT NOT VERTICALLY
      panzoomInstance = Panzoom(popupImage, {
        startY: startY,
        startScale: 1,
        maxScale: 5
      });
      
      // Enable wheel zoom
      activeContainer.addEventListener("wheel", panzoomInstance.zoomWithWheel);
      isProcessingClick = false;
    };

    // Handle errors
    popupImage.onerror = () => {
      console.error('Failed to load image:', imgSrc);
      closePopup();
      isProcessingClick = false;
    };

    // Close popup when clicking outside the image
    activeContainer.addEventListener("click", function (e) {
      if (e.target === activeContainer || e.target.classList.contains("panzoom-overlay")) {
        closePopup();
      }
    });

    // Add keyboard support for closing
    document.addEventListener("keydown", handleKeyPress);
  });
  
  isInitialized = true;  // Mark as initialized
}

// Initialize only once when the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePanzoom);
} else {
  initializePanzoom();
}