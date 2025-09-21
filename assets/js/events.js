document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/events';

  // --- DOM Elements ---
  const createEventBtn = document.getElementById('create-event-btn');
  const createModal = document.getElementById('create-event-modal');
  const editModal = document.getElementById('edit-event-modal');
  const createCloseBtn = document.getElementById('create-close-btn');
  const editCloseBtn = document.getElementById('edit-close-btn');
  const createForm = document.getElementById('create-event-form');
  const editForm = document.getElementById('edit-event-form');
  const eventsGrid = document.getElementById('events-grid');
  const createContentContainer = document.getElementById('content-blocks-container');
  const editContentContainer = document.getElementById('edit-content-blocks-container');
  const addContentBlockBtn = document.getElementById('add-content-block');
  const editAddContentBlockBtn = document.getElementById('edit-add-content-block');
  const existingCoverImageContainer = document.getElementById('existing-cover-image-container'); // NEW
  const existingImagesContainer = document.getElementById('existing-images-container');

  let createContentCount = 0;
  let editContentCount = 0;
  const MAX_BLOCKS = 10;

  // --- Modal Handling ---
  const openModal = (modal) => modal.style.display = 'flex';
  const closeModal = (modal) => modal.style.display = 'none';

  createEventBtn.addEventListener('click', () => openModal(createModal));
  createCloseBtn.addEventListener('click', () => closeModal(createModal));
  editCloseBtn.addEventListener('click', () => closeModal(editModal));
  window.addEventListener('click', (e) => {
    if (e.target === createModal) closeModal(createModal);
    if (e.target === editModal) closeModal(editModal);
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
          <button class="btn-edit" data-id="${event.id}">Edit</button>
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
        try {
          const res = await fetch(`${API_URL}/${eventId}`, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            alert('Event deleted successfully!');
            fetchEvents();
          } else {
            alert('Failed to delete event: ' + result.message);
          }
        } catch (err) {
          console.error(err);
          alert('Error deleting event.');
        }
      }
    } else if (e.target.classList.contains('btn-edit')) {
      try {
        const res = await fetch(`${API_URL}/${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch event details');
        const result = await res.json();
        if (!result.success) throw new Error(result.message || 'Failed to fetch event details');
        populateEditForm(result.data);
        openModal(editModal);
      } catch (err) {
        console.error(err);
        alert('Error fetching event details.');
      }
    }
  });

  // --- Form Submissions ---
  createForm.addEventListener('submit', handleFormSubmit('POST', API_URL, 'created', createModal));
  editForm.addEventListener('submit', (e) => {
    const eventId = document.getElementById('edit-event-id').value;
    handleFormSubmit('PUT', `${API_URL}/${eventId}`, 'updated', editModal)(e);
  });

  function handleFormSubmit(method, url, successAction, modalToClose) {
    return async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const isEdit = method === 'PUT';

      const contentContainer = isEdit ? editContentContainer : createContentContainer;
      const contentCount = isEdit ? editContentCount : createContentCount;

      const contents = [];
      for (let i = 0; i < contentCount; i++) {
        const subheading = formData.get(`subheading-${i}`) || null;
        const description = formData.get(`description-${i}`) || null;
        if (subheading || description) {
          contents.push({ subheading, description });
        }
        formData.delete(`subheading-${i}`);
        formData.delete(`description-${i}`);
      }
      formData.append('content', JSON.stringify(contents));

      try {
        const res = await fetch(url, { method, body: formData });
        const result = await res.json();
        if (result.success) {
          alert(`Event ${successAction} successfully!`);
          closeModal(modalToClose);
          e.target.reset();
          fetchEvents();
        } else {
          alert(`Failed to ${successAction} event: ` + result.message);
        }
      } catch (err) {
        console.error(err);
        alert(`Error ${successAction} event.`);
      }
    };
  }

  // --- Content Blocks ---
  function addContentBlock(container, count) {
    if (count >= MAX_BLOCKS) {
      alert(`Maximum ${MAX_BLOCKS} content blocks allowed.`);
      return count;
    }
    const block = document.createElement('div');
    block.className = 'content-block';
    block.innerHTML = `
      <div>
        <label>Subheading (optional)</label>
        <input type="text" name="subheading-${count}">
      </div>
      <div>
        <label>Description (optional)</label>
        <textarea name="description-${count}" rows="2"></textarea>
      </div>
    `;
    container.appendChild(block);
    return count + 1;
  }

  addContentBlockBtn.addEventListener('click', () => {
    createContentCount = addContentBlock(createContentContainer, createContentCount);
  });

  editAddContentBlockBtn.addEventListener('click', () => {
    editContentCount = addContentBlock(editContentContainer, editContentCount);
  });

  // --- Populate Edit Form ---
  function populateEditForm(event) {
    editForm.reset();
    document.getElementById('edit-event-id').value = event.id;
    document.getElementById('edit-title').value = event.title;
    document.getElementById('edit-event_date').value = new Date(event.event_date).toISOString().slice(0, 16);

    // Display existing cover image (NEW)
    existingCoverImageContainer.innerHTML = '';
    if (event.cover_url) {
      const coverImg = document.createElement('img');
      coverImg.src = event.cover_url;
      coverImg.alt = 'Existing cover image';
      coverImg.className = 'existing-image';
      existingCoverImageContainer.appendChild(coverImg);
    }

    // Populate content blocks
    editContentContainer.innerHTML = '';
    editContentCount = 0;
    if (event.content && Array.isArray(event.content)) {
      event.content.forEach(content => {
        const block = document.createElement('div');
        block.className = 'content-block';
        block.innerHTML = `
          <div>
            <label>Subheading (optional)</label>
            <input type="text" name="subheading-${editContentCount}" value="${content.subheading || ''}">
          </div>
          <div>
            <label>Description (optional)</label>
            <textarea name="description-${editContentCount}" rows="2">${content.description || ''}</textarea>
          </div>
        `;
        editContentContainer.appendChild(block);
        editContentCount++;
      });
    }

    // Populate existing images (now with delete buttons)
    existingImagesContainer.innerHTML = '';
    if (event.images && event.images.length > 0) {
      event.images.forEach(url => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'existing-image-wrapper';
        imgWrapper.innerHTML = `
          <img src="${url}" alt="Existing image" class="existing-image">
          <button class="btn-delete-image" data-url="${url}">&times;</button>
        `;
        existingImagesContainer.appendChild(imgWrapper);
      });
    }
  }

  // --- Delete Image Handler (NEW) ---
  existingImagesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete-image')) {
      const imageUrl = e.target.dataset.url;
      if (confirm('Are you sure you want to delete this image?')) {
        try {
          const res = await fetch(`${API_URL}/image?url=${encodeURIComponent(imageUrl)}`, {
            method: 'DELETE',
          });
          const result = await res.json();
          if (result.success) {
            alert('Image deleted successfully!');
            fetchEvents();
          } else {
            alert('Failed to delete image: ' + result.message);
          }
        } catch (err) {
          console.error(err);
          alert('Error deleting image.');
        }
      }
    }
  });

  // --- Initial Load ---
  fetchEvents();
});
