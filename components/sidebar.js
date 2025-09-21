class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <h2>Admin</h2>
                </div>
                <nav>
                    <ul>
                        <li><a href="./../index.html">Home</a></li>
                        <li><a href="/../pages/dashboard.html">Dashboard</a></li>
                        <li><a href="/../pages/events.html">Events</a></li>
                        <li><a href="#">Users</a></li>
                        <li><a href="#">Settings</a></li>
                    </ul>
                </nav>
            </div>
        `;
    }
}

customElements.define('app-sidebar', Sidebar);
