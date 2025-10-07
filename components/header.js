class Header extends HTMLElement {
    constructor() {
        super();
        // Determine the correct path to assets based on current location
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/pages/');
        const logoPath = isInSubfolder ? '../assets/images/MIIT_Logo.png' : 'assets/images/MIIT_Logo.png';
        
        this.innerHTML = `
            <div class="header">
                <div class="header-left">
                    <button id="toggle-sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <div class="header-branding">
                        <img src="${logoPath}" alt="MIIT Logo" class="header-logo">
                        <div>
                            <h1>Admin Panel</h1>
                            <p style="margin: 0; font-size: 0.875rem; color: var(--text-light);">Student Management System</p>
                        </div>
                    </div>
                </div>
                <div class="header-right">
                    <div class="user-profile">
                        <div class="user-avatar">A</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.875rem;">Admin User</div>
                            <div style="font-size: 0.75rem; color: var(--text-light);">Administrator</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        const toggleButton = this.querySelector('#toggle-sidebar');
        toggleButton.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-hidden');
        });
    }
}

customElements.define('app-header', Header);
