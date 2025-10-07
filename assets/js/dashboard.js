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

    const renderData = (data) => {
        if (!data || data.length === 0) {
            dataContainer.innerHTML = '<p>No student data available.</p>';
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
        renderData(filteredData);
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
                renderData(filteredData);
            } else {
                dataContainer.innerHTML = '<p>Failed to fetch valid data.</p>';
            }
        } catch (error) {
            console.error("Fetch error:", error);
            dataContainer.innerHTML = '<p>An error occurred while fetching data. Please check the console for more details.</p>';
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
