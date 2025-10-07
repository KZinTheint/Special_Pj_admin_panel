document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/events';
  
  // Get event ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (!eventId) {
    showError('No event ID provided in URL');
    return;
  }
  
  // DOM elements
  const loadingElement = document.getElementById('loading');
  const errorContainer = document.getElementById('error-container');
  const errorText = document.getElementById('error-text');
  const eventContent = document.getElementById('event-content');
  const eventTitle = document.getElementById('event-title');
  const eventDate = document.getElementById('event-date');
  const eventLocation = document.getElementById('event-location');
  const eventCover = document.getElementById('event-cover');
  const eventContentBlocks = document.getElementById('event-content-blocks');
  const eventGallery = document.getElementById('event-gallery');
  const eventImagesGrid = document.getElementById('event-images-grid');
  const deleteEventBtn = document.getElementById('delete-event-btn');
  
  // Image modal elements
  const imageModal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalClose = document.querySelector('.image-modal-close');
  const prevImageBtn = document.getElementById('prev-image');
  const nextImageBtn = document.getElementById('next-image');
  
  let currentImageIndex = 0;
  let galleryImages = [];
  let currentEventItem = null;
  
  // Show loading state
  function showLoading() {
    loadingElement.style.display = 'flex';
    errorContainer.style.display = 'none';
    eventContent.style.display = 'none';
  }
  
  // Show error state
  function showError(message) {
    loadingElement.style.display = 'none';
    errorContainer.style.display = 'flex';
    eventContent.style.display = 'none';
    errorText.textContent = message;
  }
  
  // Show content
  function showContent() {
    loadingElement.style.display = 'none';
    errorContainer.style.display = 'none';
    eventContent.style.display = 'block';
  }
  
  // Fetch event detail from API
  async function fetchEventDetail() {
    try {
      showLoading();
      const response = await fetch(`${API_URL}/${eventId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch event details');
      }
      
      currentEventItem = result.data;
      populateEventDetail(currentEventItem);
      showContent();
      
    } catch (error) {
      console.error('Error fetching event detail:', error);
      showError(`Failed to load event: ${error.message}`);
    }
  }
  
  // Populate event detail content
  function populateEventDetail(eventItem) {
    // Update page title
    document.title = `${eventItem.title} - Event Details`;
    
    // Set basic info
    eventTitle.textContent = eventItem.title;
    
    // Format and set event date
    if (eventItem.event_date) {
      const eventDateTime = new Date(eventItem.event_date);
      eventDate.textContent = eventDateTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      eventDate.textContent = 'Date TBD';
    }
    
    // Set location if available
    if (eventItem.location) {
      eventLocation.textContent = eventItem.location;
      eventLocation.style.display = 'flex';
    } else {
      eventLocation.style.display = 'none';
    }
    
    // Set cover image
    if (eventItem.cover_url) {
      eventCover.src = eventItem.cover_url;
      eventCover.alt = eventItem.title;
    }
    
    // Populate content blocks
    populateContentBlocks(eventItem.content || []);
    
    // Populate gallery
    populateGallery(eventItem.images || []);
  }
  
  // Populate content blocks
  function populateContentBlocks(contentBlocks) {
    eventContentBlocks.innerHTML = '';
    
    if (!contentBlocks || contentBlocks.length === 0) {
      eventContentBlocks.innerHTML = '<div class="content-block-display"><p class="no-content">No additional content available.</p></div>';
      return;
    }
    
    contentBlocks.forEach((block, index) => {
      const blockElement = document.createElement('div');
      blockElement.className = 'content-block-display';
      
      let blockHTML = '';
      
      if (block.subheading) {
        blockHTML += `<h3>${escapeHtml(block.subheading)}</h3>`;
      }
      
      if (block.description) {
        blockHTML += `<p>${escapeHtml(block.description).replace(/\n/g, '<br>')}</p>`;
      }
      
      blockElement.innerHTML = blockHTML;
      eventContentBlocks.appendChild(blockElement);
    });
  }
  
  // Populate gallery
  function populateGallery(images) {
    if (!images || images.length === 0) {
      eventGallery.style.display = 'none';
      return;
    }
    
    eventGallery.style.display = 'block';
    eventImagesGrid.innerHTML = '';
    galleryImages = images;
    
    images.forEach((image, index) => {
      const imageElement = document.createElement('img');
      imageElement.className = 'gallery-image';
      imageElement.src = image;
      imageElement.alt = `Event image ${index + 1}`;
      imageElement.addEventListener('click', () => openImageModal(index));
      eventImagesGrid.appendChild(imageElement);
    });
  }
  
  // Image modal functions
  function openImageModal(imageIndex) {
    currentImageIndex = imageIndex;
    modalImage.src = galleryImages[imageIndex];
    imageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  function closeImageModal() {
    imageModal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    modalImage.src = galleryImages[currentImageIndex];
  }
  
  function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    modalImage.src = galleryImages[currentImageIndex];
  }
  
  // Utility function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Event handlers
  
  // Image modal event handlers
  modalClose.addEventListener('click', closeImageModal);
  nextImageBtn.addEventListener('click', showNextImage);
  prevImageBtn.addEventListener('click', showPrevImage);
  
  // Close modal when clicking outside the image
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      closeImageModal();
    }
  });
  
  // Keyboard navigation for image modal
  document.addEventListener('keydown', (e) => {
    if (imageModal.style.display === 'flex') {
      switch (e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          showPrevImage();
          break;
        case 'ArrowRight':
          showNextImage();
          break;
      }
    }
  });
  
  // Delete event button handler
  deleteEventBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      // Show loading on delete button
      const originalText = deleteEventBtn.textContent;
      deleteEventBtn.textContent = 'Deleting...';
      deleteEventBtn.disabled = true;
      
      const response = await fetch(`${API_URL}/${eventId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Event deleted successfully!');
        // Redirect to events page
        window.location.href = 'events.html';
      } else {
        throw new Error(result.message || 'Failed to delete event');
      }
      
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event: ${error.message}`);
      
      // Restore button state
      deleteEventBtn.textContent = originalText;
      deleteEventBtn.disabled = false;
    }
  });
  
  // Initialize page
  fetchEventDetail();
});