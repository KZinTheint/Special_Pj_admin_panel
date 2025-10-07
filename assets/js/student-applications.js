document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const deleteButton = document.getElementById('delete-action');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');

    const apiUrl = 'http://localhost:3000/registeration';
    const fileApiUrl = 'http://localhost:3000/registeration/file'; // new endpoint for signed URL
    
    // Store all student data for frontend filtering
    let allStudentData = [];

    // Enhanced empty state functions
    const renderEmptyState = (type = 'no-data', searchQuery = '', searchType = '') => {
        let emptyStateHtml = '';
        
        if (type === 'no-data') {
            emptyStateHtml = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                    </div>
                    <div class="empty-state-content">
                        <h3>No Student Applications Found</h3>
                        <p>There are currently no student applications in the system. New applications will appear here once students start submitting their forms.</p>
                        <div class="empty-state-actions">
                            <button class="empty-state-btn" onclick="location.reload()">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (type === 'no-results') {
            const searchTypeDisplay = {
                'formId': 'Form ID',
                'name': 'Name', 
                'nrc': 'NRC'
            }[searchType] || 'Search';
            
            emptyStateHtml = `
                <div class="empty-state">
                    <div class="empty-state-icon search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                    </div>
                    <div class="empty-state-content">
                        <h3>No Results Found</h3>
                        <p>We couldn't find any student applications matching <strong>"${searchQuery}"</strong> in ${searchTypeDisplay}.</p>
                        <div class="empty-state-suggestions">
                            <h4>Try:</h4>
                            <ul>
                                <li>Checking your spelling</li>
                                <li>Using different keywords</li>
                                <li>Searching in a different field</li>
                                <li>Clearing the search to see all results</li>
                            </ul>
                        </div>
                        <div class="empty-state-actions">
                            <button class="empty-state-btn primary" onclick="document.getElementById('search-input').value = ''; document.getElementById('search-input').dispatchEvent(new Event('input'));">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Clear Search
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (type === 'error') {
            emptyStateHtml = `
                <div class="empty-state error">
                    <div class="empty-state-icon error-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div class="empty-state-content">
                        <h3>Unable to Load Data</h3>
                        <p>We encountered an error while loading student applications. Please check your connection and try again.</p>
                        <div class="empty-state-actions">
                            <button class="empty-state-btn primary" onclick="location.reload()">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                </svg>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return emptyStateHtml;
    };

    const renderData = (data, isFiltered = false, searchQuery = '', searchType = '') => {
        if (!data || data.length === 0) {
            const emptyStateType = isFiltered ? 'no-results' : 'no-data';
            dataContainer.innerHTML = renderEmptyState(emptyStateType, searchQuery, searchType);
            return;
        }

        const tableRowsHtml = data.map(student => {
            const filesHtml = student.files.map(file => `
                <a href="#" class="file-link" data-id="${student.id}" data-filename="${file.name}">
                    ${file.name}
                </a>
            `).join('<br>');

            const getProgramAbbreviation = (program) => {
                if (program === 'electronic-communication-engineering') return 'ECE';
                if (program === 'computer-science-engineering') return 'CSE';
                return program;
            };

            return `
                <tr data-id="${student.id}">
                    <td><input type="checkbox" class="row-checkbox"></td>
                    <td>${student.form_id}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.email}</td>
                    <td>${student.phone_number}</td>
                    <td>${student.date_of_birth}</td>
                    <td>${getProgramAbbreviation(student.desired_program)}</td>
                    <td>${student.high_school_marks}</td>
                    <td>${student.nationality}</td>
                    <td>${student.national_id_prefix}/${student.national_id_region}/${student.citizen_type}${student.national_id_number}</td>
                    <td>${student.city}</td>
                    <td class="files-cell">${filesHtml}</td>
                </tr>
            `;
        }).join('');

        const tableHtml = `
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all-checkbox"></th>
                            <th>Form-ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>DOB</th>
                            <th>Program</th>
                            <th>Marks</th>
                            <th>Nationality</th>
                            <th>NRC</th>
                            <th>City</th>
                            <th>Documents</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </div>
        `;

        dataContainer.innerHTML = tableHtml;

        // Add event listener for the select-all checkbox
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');

        selectAllCheckbox.addEventListener('change', (e) => {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        });

        // Add click event listeners to file links
        document.querySelectorAll('.file-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const registrationId = link.dataset.id;
                const fileName = link.dataset.filename;

                try {
                    const res = await fetch(`${fileApiUrl}/${encodeURIComponent(registrationId)}/${encodeURIComponent(fileName)}`);
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                    const result = await res.json();
                    if (result.success && result.file && result.file.url) {
                        // Fetch the file as a blob
                        const fileResponse = await fetch(result.file.url);
                        const blob = await fileResponse.blob();

                        // Create a temporary URL and trigger download
                        const a = document.createElement('a');
                        const url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = result.file.name;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url); // cleanup
                    } else {
                        alert("Failed to get file URL.");
                    }
                } catch (err) {
                    console.error("File download error:", err);
                    alert("An error occurred while fetching the file.");
                }
            });

        });
    };

    // Frontend search filtering function
    const filterStudentData = (data, searchQuery, searchType) => {
        if (!searchQuery || searchQuery.trim() === '') {
            return data; // Return all data if no search query
        }

        const query = searchQuery.toLowerCase().trim();
        
        return data.filter(student => {
            switch (searchType) {
                case 'formId':
                    return student.form_id && student.form_id.toLowerCase().includes(query);
                    
                case 'name':
                    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
                    return fullName.includes(query);
                    
                case 'nrc':
                    const nrcString = `${student.national_id_prefix || ''}/${student.national_id_region || ''}/${student.citizen_type || ''}${student.national_id_number || ''}`.toLowerCase();
                    return nrcString.includes(query);
                    
                default:
                    return false;
            }
        });
    };

    // Function to perform search and render results
    const performSearch = () => {
        const searchQuery = searchInput.value;
        const searchTypeValue = searchType.value;
        
        const filteredData = filterStudentData(allStudentData, searchQuery, searchTypeValue);
        const isFiltered = searchQuery && searchQuery.trim() !== '';
        renderData(filteredData, isFiltered, searchQuery, searchTypeValue);
    };

    const fetchData = async () => {
        try {
            loadingIndicator.style.display = 'block';
            dataContainer.innerHTML = '';
            
            // Always fetch all data (no search parameters)
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                // Store all data for frontend filtering
                allStudentData = result.data;
                
                // Render all data initially, or filtered data if there's a search query
                const searchQuery = searchInput.value;
                const searchTypeValue = searchType.value;
                const filteredData = filterStudentData(allStudentData, searchQuery, searchTypeValue);
                const isFiltered = searchQuery && searchQuery.trim() !== '';
                renderData(filteredData, isFiltered, searchQuery, searchTypeValue);
            } else {
                dataContainer.innerHTML = renderEmptyState('error');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            dataContainer.innerHTML = renderEmptyState('error');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    const handleDelete = async () => {
        const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
        const idsToDelete = Array.from(selectedCheckboxes).map(checkbox => checkbox.closest('tr').dataset.id);

        if (idsToDelete.length === 0) {
            alert("Please select at least one row to delete.");
            return;
        }

        const confirmation = confirm(`Are you sure you want to delete ${idsToDelete.length} student(s)?`);
        if (!confirmation) return;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToDelete })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            await fetchData();
            alert("Selected students have been successfully deleted.");
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred during deletion.");
        }
    };

    deleteButton.addEventListener('click', handleDelete);
    
    // Update search button to use frontend search instead of fetchData
    searchButton.addEventListener('click', performSearch);
    
    // Add real-time search as user types
    searchInput.addEventListener('input', performSearch);
    
    // Add event listener for search type change
    searchType.addEventListener('change', performSearch);
    
    // Initial data fetch
    fetchData();
});
