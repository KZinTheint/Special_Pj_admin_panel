class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <div class="logo-icon">M</div>
                        <div>
                            <h2>MIIT Admin</h2>
                            <p style="font-size: 0.75rem; color: #94a3b8; margin: 0;">Management Panel</p>
                        </div>
                    </div>
                </div>
                <nav>
                    <ul>
                        <li>
                            <a href="./../index.html" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                </svg>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="/../pages/dashboard.html" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Student Applications</span>
                            </a>
                        </li>
                        <li>
                            <a href="/../pages/events.html" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span>Events</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                                <span>Users</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="nav-link">
                                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span>Settings</span>
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
