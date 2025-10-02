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

  // --- Modal Handling ---
  const openModal = (modal) => modal.style.display = 'flex';
  const closeModal = (modal) => modal.style.display = 'none';

  createEventBtn.addEventListener('click', () => {
    createForm.reset();
    createContentContainer.innerHTML = '';
    createContentCount = 0;
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
    }
  });

  // --- Form Submission ---
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

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

    try {
      const res = await fetch(API_URL, { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        alert('Event created successfully!');
        closeModal(createModal);
        e.target.reset();
        fetchEvents();
      } else {
        alert('Failed to create event: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating event.');
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

  // --- Initial Load ---
  fetchEvents();
});
