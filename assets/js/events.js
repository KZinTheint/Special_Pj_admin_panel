document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/events';

  // --- DOM Elements ---
  const createEventBtn = document.getElementById('create-event-btn');
  const createModal = document.getElementById('create-event-modal');
  const createCloseBtn = document.getElementById('create-close-btn');
  const createForm = document.getElementById('create-event-form');
  const eventsGrid = document.getElementById('events-grid');
  const createContentContainer = document.getElementById('content-blocks-container');
  const addContentBlockBtn = document.getElementById('add-content-block');

  let createContentCount = 0;
  const MAX_BLOCKS = 10;

  // --- Loading State Management ---
  function showLoadingSpinner(element, text = 'Loading...') {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.disabled = true;
    element.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>${text}</span>
      </div>
    `;
    element.classList.add('loading');
    return originalContent;
  }

  function hideLoadingSpinner(element) {
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
      element.innerHTML = originalContent;
      delete element.dataset.originalContent;
    }
    element.disabled = false;
    element.classList.remove('loading');
  }

  function showPageLoading(show = true) {
    let loadingOverlay = document.getElementById('page-loading-overlay');
    
    if (show && !loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'page-loading-overlay';
      loadingOverlay.className = 'page-loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="page-loading-content">
          <div class="page-spinner"></div>
          <p>Processing...</p>
        </div>
      `;
      document.body.appendChild(loadingOverlay);
    } else if (!show && loadingOverlay) {
      loadingOverlay.remove();
    }
  }

  // --- Enhanced UI Elements ---
  const coverInput = document.getElementById('cover_image');
  const imagesInput = document.getElementById('images');
  const coverPreview = document.getElementById('cover-preview');
  const imagesPreviewGrid = document.getElementById('images-preview-grid');
  const coverDropzone = document.getElementById('cover-dropzone');
  const imagesDropzone = document.getElementById('images-dropzone');
  const imagesHint = document.getElementById('images-hint');

  // DataTransfer to manage multiple image selection and removal
  let imagesDT = new DataTransfer();

  // --- Modal Handling ---
  const openModal = (modal) => modal.style.display = 'flex';
  const closeModal = (modal) => modal.style.display = 'none';

  createEventBtn.addEventListener('click', () => {
    createForm.reset();
    createContentContainer.innerHTML = '';
    createContentCount = 0;
    // reset UI previews and counters
    imagesDT = new DataTransfer();
    if (imagesPreviewGrid) imagesPreviewGrid.innerHTML = '';
    if (coverPreview) { coverPreview.src = ''; coverPreview.style.display = 'none'; }
    if (imagesHint) imagesHint.textContent = '0/10 selected. First image may be used as thumbnail.';
    openModal(createModal);
  });
  createCloseBtn.addEventListener('click', () => closeModal(createModal));
  window.addEventListener('click', (e) => {
    if (e.target === createModal) closeModal(createModal);
  });

  // --- Fetch Events ---
  async function fetchEvents() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch events');
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to fetch events');
      populateEventsGrid(result.data);
    } catch (err) {
      console.error(err);
      eventsGrid.innerHTML = '<p>Error fetching events. Please try again later.</p>';
    }
  }

  // --- Populate Grid ---
  function populateEventsGrid(events) {
    eventsGrid.innerHTML = '';
    if (events.length === 0) {
      eventsGrid.innerHTML = '<p>No events found. Create one to get started!</p>';
      return;
    }

    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      eventCard.innerHTML = `
        <img src="${event.cover_url}" alt="${event.title}" class="event-card-image">
        <div class="event-card-content">
          <h3>${event.title}</h3>
          <p>${new Date(event.event_date).toLocaleString()}</p>
        </div>
        <div class="event-card-actions">
          <button class="btn-delete" data-id="${event.id}">Delete</button>
        </div>
      `;
      eventsGrid.appendChild(eventCard);
    });
  }

  // --- Grid Button Handlers ---
  eventsGrid.addEventListener('click', async (e) => {
    const eventId = e.target.dataset.id;
    if (e.target.classList.contains('btn-delete')) {
      if (confirm('Are you sure you want to delete this event?')) {
        const deleteButton = e.target;
        try {
          showLoadingSpinner(deleteButton, 'Deleting...');
          showPageLoading(true);
          
          const res = await fetch(`${API_URL}/${eventId}`, { method: 'DELETE' });
          const result = await res.json();
          
          if (result.success) {
            alert('Event deleted successfully!');
            await fetchEvents();
          } else {
            alert('Failed to delete event: ' + result.message);
          }
        } catch (err) {
          console.error(err);
          alert('Error deleting event.');
        } finally {
          hideLoadingSpinner(deleteButton);
          showPageLoading(false);
        }
      }
    }
  });

  // --- Form Submission ---
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    const formElements = e.target.querySelectorAll('button, input, textarea, select');
    
    try {
      // Ensure images input reflects current imagesDT selection FIRST
      if (imagesInput) {
        imagesInput.files = imagesDT.files;
      }

      // Create FormData BEFORE disabling elements
      const formData = new FormData(e.target);

      // NOW disable all form elements and show loading
      showLoadingSpinner(submitButton, 'Creating Event...');
      formElements.forEach(el => {
        if (el !== submitButton) el.disabled = true;
      });
      showPageLoading(true);

      const contents = [];
      for (let i = 0; i < createContentCount; i++) {
        const subheading = formData.get(`subheading-${i}`) || null;
        const description = formData.get(`description-${i}`) || null;
        if (subheading || description) {
          contents.push({ subheading, description });
        }
        formData.delete(`subheading-${i}`);
        formData.delete(`description-${i}`);
      }
      formData.append('content', JSON.stringify(contents));

      const res = await fetch(API_URL, { method: 'POST', body: formData });
      const result = await res.json();
      
      if (result.success) {
        alert('Event created successfully!');
        closeModal(createModal);
        e.target.reset();
        // Reset UI state
        imagesDT = new DataTransfer();
        if (imagesPreviewGrid) imagesPreviewGrid.innerHTML = '';
        if (coverPreview) { coverPreview.src = ''; coverPreview.style.display = 'none'; }
        if (imagesHint) imagesHint.textContent = '0/10 selected. First image may be used as thumbnail.';
        createContentContainer.innerHTML = '';
        createContentCount = 0;
        await fetchEvents();
      } else {
        alert('Failed to create event: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating event.');
    } finally {
      // Re-enable form elements and hide loading
      hideLoadingSpinner(submitButton);
      formElements.forEach(el => {
        if (el !== submitButton) el.disabled = false;
      });
      showPageLoading(false);
    }
  });

  // --- Content Blocks ---
  function addContentBlock(container, count) {
    if (count >= MAX_BLOCKS) {
      alert(`Maximum ${MAX_BLOCKS} content blocks allowed.`);
      return count;
    }
    const block = document.createElement('div');
    block.className = 'content-block';
    block.innerHTML = `
      <div class="content-grid">
        <div>
          <label>Subheading (optional)</label>
          <input type="text" name="subheading-${count}" placeholder="Enter subheading...">
        </div>
        <div>
          <label>Description (optional)</label>
          <textarea name="description-${count}" rows="3" placeholder="Write a brief description..."></textarea>
        </div>
      </div>
      <div class="block-actions">
        <button type="button" class="btn-secondary btn-remove-block">Remove</button>
      </div>
    `;
    const removeBtn = block.querySelector('.btn-remove-block');
    removeBtn.addEventListener('click', () => block.remove());
    container.appendChild(block);
    return count + 1;
  }

  addContentBlockBtn.addEventListener('click', () => {
    createContentCount = addContentBlock(createContentContainer, createContentCount);
  });

  // --- Image Previews and Dropzones ---
  function updateCoverPreview(file) {
    if (!file || !coverPreview) return;
    const url = URL.createObjectURL(file);
    coverPreview.src = url;
    coverPreview.style.display = 'block';
  }

  function refreshImagesPreview() {
    if (!imagesPreviewGrid || !imagesHint) return;
    imagesPreviewGrid.innerHTML = '';
    const files = Array.from(imagesDT.files);
    files.forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const wrapper = document.createElement('div');
      wrapper.className = 'thumb';
      wrapper.innerHTML = `
        <img src="${url}" alt="Image ${idx + 1}">
        <button type="button" class="thumb-remove" aria-label="Remove image">×</button>
      `;
      wrapper.querySelector('.thumb-remove').addEventListener('click', () => {
        // Remove this file from DataTransfer
        const dt = new DataTransfer();
        Array.from(imagesDT.files).forEach((f, i) => {
          if (i !== idx) dt.items.add(f);
        });
        imagesDT = dt;
        imagesInput.files = imagesDT.files;
        refreshImagesPreview();
      });
      imagesPreviewGrid.appendChild(wrapper);
    });
    imagesHint.textContent = `${files.length}/10 selected. First image may be used as thumbnail.`;
  }

  function addImages(files) {
    const current = Array.from(imagesDT.files);
    const toAdd = Array.from(files).filter(f => f.type.startsWith('image/'));
    const totalAllowed = 10 - current.length;
    const finalAdd = toAdd.slice(0, Math.max(0, totalAllowed));
    if (toAdd.length > finalAdd.length) {
      alert('You can upload up to 10 images in total. Extra files were ignored.');
    }
    const dt = new DataTransfer();
    [...current, ...finalAdd].forEach(f => dt.items.add(f));
    imagesDT = dt;
    imagesInput.files = imagesDT.files;
    refreshImagesPreview();
  }

  if (coverInput) {
    coverInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        updateCoverPreview(file);
      }
    });
  }

  if (imagesInput) {
    imagesInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        addImages(e.target.files);
      }
    });
  }

  function setupDropzone(dropzone, onFiles) {
    if (!dropzone) return;
    const addDragOver = (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    };
    const removeDragOver = (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    };
    dropzone.addEventListener('dragover', addDragOver);
    dropzone.addEventListener('dragleave', removeDragOver);
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const files = e.dataTransfer?.files;
      if (files && files.length) onFiles(files);
    });
    dropzone.addEventListener('click', (e) => {
      const input = dropzone.querySelector('input[type="file"]');
      if (e.target !== input) {
        e.preventDefault();
        input.click();
      }
    });
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const input = dropzone.querySelector('input[type="file"]');
        if (input) input.click();
      }
    });
  }

  setupDropzone(coverDropzone, (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      coverInput.files = dt.files;
      updateCoverPreview(file);
    }
  });

  setupDropzone(imagesDropzone, (files) => addImages(files));

  // --- Initial Load ---
  fetchEvents();
});
