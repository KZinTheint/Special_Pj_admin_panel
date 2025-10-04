document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/news';

  // --- DOM Elements ---
  const createNewsBtn = document.getElementById('create-news-btn');
  const createModal = document.getElementById('create-news-modal');
  const createCloseBtn = document.getElementById('create-close-btn');
  const createForm = document.getElementById('create-news-form');
  const newsGrid = document.getElementById('news-grid');
  const createContentContainer = document.getElementById('content-blocks-container');
  const addContentBlockBtn = document.getElementById('add-content-block');

  let createContentCount = 0;
  const MAX_BLOCKS = 10;

  // --- Enhanced UI Elements ---
  const coverInput = document.getElementById('cover_image');
  const imagesInput = document.getElementById('images');
  const filesInput = document.getElementById('files');
  const coverPreview = document.getElementById('cover-preview');
  const imagesPreviewGrid = document.getElementById('images-preview-grid');
  const filesPreviewList = document.getElementById('files-preview-list');
  const coverDropzone = document.getElementById('cover-dropzone');
  const imagesDropzone = document.getElementById('images-dropzone');
  const filesDropzone = document.getElementById('files-dropzone');
  const imagesHint = document.getElementById('images-hint');
  const filesHint = document.getElementById('files-hint');

  // DataTransfer to manage multiple file selection and removal
  let imagesDT = new DataTransfer();
  let filesDT = new DataTransfer();

  // --- Modal Handling ---
  const openModal = (modal) => modal.style.display = 'flex';
  const closeModal = (modal) => modal.style.display = 'none';

  createNewsBtn.addEventListener('click', () => {
    createForm.reset();
    createContentContainer.innerHTML = '';
    createContentCount = 0;
    // reset UI previews and counters
    imagesDT = new DataTransfer();
    filesDT = new DataTransfer();
    if (imagesPreviewGrid) imagesPreviewGrid.innerHTML = '';
    if (filesPreviewList) filesPreviewList.innerHTML = '';
    if (coverPreview) { coverPreview.src = ''; coverPreview.style.display = 'none'; }
    if (imagesHint) imagesHint.textContent = '0/10 selected. First image may be used as thumbnail.';
    if (filesHint) filesHint.textContent = '0/5 selected. Maximum 10MB per file.';
    openModal(createModal);
  });
  createCloseBtn.addEventListener('click', () => closeModal(createModal));
  window.addEventListener('click', (e) => {
    if (e.target === createModal) closeModal(createModal);
  });

  // --- Fetch News ---
  async function fetchNews() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch news');
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to fetch news');
      populateNewsGrid(result.data.news);
    } catch (err) {
      console.error(err);
      newsGrid.innerHTML = '<p>Error fetching news. Please try again later.</p>';
    }
  }

  // --- Populate Grid ---
  function populateNewsGrid(news) {
    newsGrid.innerHTML = '';
    if (news.length === 0) {
      newsGrid.innerHTML = '<p>No news found. Create one to get started!</p>';
      return;
    }

    news.forEach(newsItem => {
      const newsCard = document.createElement('div');
      newsCard.className = 'news-card';
      newsCard.innerHTML = `
        <img src="${newsItem.cover_url}" alt="${newsItem.title}" class="news-card-image">
        <div class="news-card-content">
          <h3>${newsItem.title}</h3>
          <p>${newsItem.created_at ? new Date(newsItem.created_at).toLocaleDateString() : 'Recently published'}</p>
        </div>
        <div class="news-card-actions">
          <button class="btn-view" data-id="${newsItem.id}">View Details</button>
          <button class="btn-delete" data-id="${newsItem.id}">Delete</button>
        </div>
      `;
      newsGrid.appendChild(newsCard);
    });
  }

  // --- Grid Button Handlers ---
  newsGrid.addEventListener('click', async (e) => {
    const newsId = e.target.dataset.id;
    
    if (e.target.classList.contains('btn-view')) {
      // Navigate to news detail page
      window.location.href = `news-detail.html?id=${newsId}`;
      return;
    }
    
    if (e.target.classList.contains('btn-delete')) {
      if (confirm('Are you sure you want to delete this news?')) {
        try {
          const res = await fetch(`${API_URL}/${newsId}`, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            alert('News deleted successfully!');
            fetchNews();
          } else {
            alert('Failed to delete news: ' + result.message);
          }
        } catch (err) {
          console.error(err);
          alert('Error deleting news.');
        }
      }
    }
  });

  // --- Form Submission ---
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ensure images and files inputs reflect current DataTransfer selections
    if (imagesInput) {
      imagesInput.files = imagesDT.files;
    }
    if (filesInput) {
      filesInput.files = filesDT.files;
    }

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
        alert('News created successfully!');
        closeModal(createModal);
        e.target.reset();
        fetchNews();
      } else {
        alert('Failed to create news: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating news.');
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

  // --- File Handling Functions ---
  function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      txt: '📄',
      zip: '🗜️', rar: '🗜️'
    };
    return iconMap[ext] || '📎';
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function refreshFilesPreview() {
    if (!filesPreviewList || !filesHint) return;
    filesPreviewList.innerHTML = '';
    const files = Array.from(filesDT.files);
    files.forEach((file, idx) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-info">
          <span class="file-icon">${getFileIcon(file.name)}</span>
          <div class="file-details">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
          </div>
        </div>
        <button type="button" class="file-remove" aria-label="Remove file">×</button>
      `;
      fileItem.querySelector('.file-remove').addEventListener('click', () => {
        // Remove this file from DataTransfer
        const dt = new DataTransfer();
        Array.from(filesDT.files).forEach((f, i) => {
          if (i !== idx) dt.items.add(f);
        });
        filesDT = dt;
        filesInput.files = filesDT.files;
        refreshFilesPreview();
      });
      filesPreviewList.appendChild(fileItem);
    });
    filesHint.textContent = `${files.length}/5 selected. Maximum 10MB per file.`;
  }

  function addFiles(files) {
    const current = Array.from(filesDT.files);
    const toAdd = Array.from(files).filter(f => {
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.rar'];
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(ext)) return false;
      
      // Check file size (10MB limit)
      if (f.size > 10 * 1024 * 1024) {
        alert(`File "${f.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    const totalAllowed = 5 - current.length;
    const finalAdd = toAdd.slice(0, Math.max(0, totalAllowed));
    if (toAdd.length > finalAdd.length) {
      alert('You can upload up to 5 files in total. Extra files were ignored.');
    }
    if (finalAdd.length === 0 && toAdd.length > 0) {
      alert('No valid files to add. Please check file types and sizes.');
    }
    const dt = new DataTransfer();
    [...current, ...finalAdd].forEach(f => dt.items.add(f));
    filesDT = dt;
    filesInput.files = filesDT.files;
    refreshFilesPreview();
  }

  // Files input change handler
  if (filesInput) {
    filesInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        addFiles(e.target.files);
      }
    });
  }

  // Setup files dropzone
  setupDropzone(filesDropzone, (files) => addFiles(files));

  // --- Initial Load ---
  fetchNews();
});
