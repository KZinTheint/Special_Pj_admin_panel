class Sidebar extends HTMLElement {
    constructor() {
        super();
        // Determine the correct path to assets based on current location
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/pages/');
        const logoPath = isInSubfolder ? '../assets/images/MIIT_Logo.png' : 'assets/images/MIIT_Logo.png';
        const indexPath = isInSubfolder ? '../index.html' : './index.html';
        const studentAppsPath = isInSubfolder ? './student-applications.html' : 'pages/student-applications.html';
        const eventsPath = isInSubfolder ? './events.html' : 'pages/events.html';
        const newsPath = isInSubfolder ? './news.html' : 'pages/news.html';
        
        this.innerHTML = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <img src="${logoPath}" alt="MIIT Logo" class="logo-image">
                        <div>
                            <h2>Admin Panel</h2>
                            <p style="font-size: 0.75rem; color: #94a3b8; margin: 0;">Management System</p>
                        </div>
                    </div>
                </div>
                <nav>
                    <ul>
                        <li>
                            <a href="${indexPath}" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                </svg>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="${studentAppsPath}" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Student Applications</span>
                            </a>
                        </li>
                        <li>
                            <a href="${eventsPath}" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span>Events</span>
                            </a>
                        </li>
                        <li>
                            <a href="${newsPath}" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                                </svg>
                                <span>News</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                <div style="position: absolute; bottom: 2rem; left: 1.5rem; right: 1.5rem;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 12px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 0.75rem; margin: 0;">© 2024 MIIT</p>
                        <p style="color: #64748b; font-size: 0.625rem; margin: 0.25rem 0 0 0;">Myanmar Institute of Information Technology</p>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('app-sidebar', Sidebar);
