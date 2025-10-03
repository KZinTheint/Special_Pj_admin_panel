document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/news';
  
  // Get news ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');
  
  if (!newsId) {
    showError('No news ID provided in URL');
    return;
  }
  
  // DOM elements
  const loadingElement = document.getElementById('loading');
  const errorContainer = document.getElementById('error-container');
  const errorText = document.getElementById('error-text');
  const newsContent = document.getElementById('news-content');
  const newsTitle = document.getElementById('news-title');
  const newsDate = document.getElementById('news-date');
  const newsCover = document.getElementById('news-cover');
  const newsContentBlocks = document.getElementById('news-content-blocks');
  const newsGallery = document.getElementById('news-gallery');
  const newsImagesGrid = document.getElementById('news-images-grid');
  const editNewsBtn = document.getElementById('edit-news-btn');
  const deleteNewsBtn = document.getElementById('delete-news-btn');
  
  // Image modal elements
  const imageModal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalClose = document.querySelector('.image-modal-close');
  const prevImageBtn = document.getElementById('prev-image');
  const nextImageBtn = document.getElementById('next-image');
  
  let currentImageIndex = 0;
  let galleryImages = [];
  let currentNewsItem = null;
  
  // Show loading state
  function showLoading() {
    loadingElement.style.display = 'flex';
    errorContainer.style.display = 'none';
    newsContent.style.display = 'none';
  }
  
  // Show error state
  function showError(message) {
    loadingElement.style.display = 'none';
    errorContainer.style.display = 'flex';
    newsContent.style.display = 'none';
    errorText.textContent = message;
  }
  
  // Show content
  function showContent() {
    loadingElement.style.display = 'none';
    errorContainer.style.display = 'none';
    newsContent.style.display = 'block';
  }
  
  // Fetch news detail from API
  async function fetchNewsDetail() {
    try {
      showLoading();
      const response = await fetch(`${API_URL}/${newsId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch news details');
      }
      
      currentNewsItem = result.data;
      populateNewsDetail(currentNewsItem);
      showContent();
      
    } catch (error) {
      console.error('Error fetching news detail:', error);
      showError(`Failed to load news: ${error.message}`);
    }
  }
  
  // Populate news detail content
  function populateNewsDetail(newsItem) {
    // Update page title
    document.title = `${newsItem.title} - News Detail`;
    
    // Set basic info
    newsTitle.textContent = newsItem.title;
    newsDate.textContent = newsItem.created_at ? 
      new Date(newsItem.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Recently published';
    
    // Set cover image
    if (newsItem.cover_url) {
      newsCover.src = newsItem.cover_url;
      newsCover.alt = newsItem.title;
    }
    
    // Populate content blocks
    populateContentBlocks(newsItem.content || []);
    
    // Populate gallery
    populateGallery(newsItem.images || []);
  }
  
  // Populate content blocks
  function populateContentBlocks(contentBlocks) {
    newsContentBlocks.innerHTML = '';
    
    if (!contentBlocks || contentBlocks.length === 0) {
      newsContentBlocks.innerHTML = '<p class="no-content">No additional content available.</p>';
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
      newsContentBlocks.appendChild(blockElement);
    });
  }
  
  // Populate gallery
  function populateGallery(images) {
    if (!images || images.length === 0) {
      newsGallery.style.display = 'none';
      return;
    }
    
    newsGallery.style.display = 'block';
    newsImagesGrid.innerHTML = '';
    galleryImages = images;
    
    images.forEach((image, index) => {
      const imageElement = document.createElement('div');
      imageElement.className = 'gallery-image';
      imageElement.innerHTML = `<img src="${image.url}" alt="Gallery image ${index + 1}">`;
      imageElement.addEventListener('click', () => openImageModal(index));
      newsImagesGrid.appendChild(imageElement);
    });
  }
  
  // Open image modal
  function openImageModal(index) {
    currentImageIndex = index;
    modalImage.src = galleryImages[index].url;
    modalImage.alt = `Gallery image ${index + 1}`;
    imageModal.style.display = 'flex';
    
    // Update navigation buttons
    prevImageBtn.disabled = index === 0;
    nextImageBtn.disabled = index === galleryImages.length - 1;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  // Close image modal
  function closeImageModal() {
    imageModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  // Navigate images in modal
  function navigateImage(direction) {
    const newIndex = currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < galleryImages.length) {
      openImageModal(newIndex);
    }
  }
  
  // Delete news item
  async function deleteNews() {
    if (!confirm('Are you sure you want to delete this news item? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/${newsId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('News deleted successfully!');
        window.location.href = 'news.html';
      } else {
        alert('Failed to delete news: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Error deleting news. Please try again.');
    }
  }
  
  // Utility function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Event listeners
  editNewsBtn.addEventListener('click', () => {
    // Redirect to news page with edit mode
    window.location.href = `news.html?edit=${newsId}`;
  });
  
  deleteNewsBtn.addEventListener('click', deleteNews);
  
  // Image modal event listeners
  modalClose.addEventListener('click', closeImageModal);
  prevImageBtn.addEventListener('click', () => navigateImage(-1));
  nextImageBtn.addEventListener('click', () => navigateImage(1));
  
  // Close modal when clicking outside
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      closeImageModal();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (imageModal.style.display === 'flex') {
      switch(e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          navigateImage(-1);
          break;
        case 'ArrowRight':
          navigateImage(1);
          break;
      }
    }
  });
  
  // Initialize - fetch news detail
  fetchNewsDetail();
});