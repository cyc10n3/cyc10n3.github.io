// Component templates
const HEADER_TEMPLATE = `
<nav class="navbar" id="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <img src="assets/images/logo-hq.png" alt="Wellhead Equipment Engineers" class="logo">
        </div>
        <ul class="nav-menu" id="nav-menu">
            <li class="nav-item">
                <a href="index.html" class="nav-link" data-page="index.html">Home</a>
            </li>
            <li class="nav-item">
                <a href="about.html" class="nav-link" data-page="about.html">About</a>
            </li>
            <li class="nav-item">
                <a href="services.html" class="nav-link" data-page="services.html">Services</a>
            </li>
            <li class="nav-item">
                <a href="products.html" class="nav-link" data-page="products.html">Products</a>
            </li>
            <li class="nav-item">
                <a href="certification.html" class="nav-link" data-page="certification.html">Certification</a>
            </li>
            <li class="nav-item">
                <a href="careers.html" class="nav-link" data-page="careers.html">Careers</a>
            </li>
            <li class="nav-item">
                <a href="contact.html" class="nav-link" data-page="contact.html">Contact</a>
            </li>
        </ul>
        <div class="hamburger" id="hamburger">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </div>
    </div>
</nav>
`;

const FOOTER_TEMPLATE = `
<footer class="footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-section">
                <div class="footer-logo">
                    <img src="assets/images/logo-hq.png" alt="Wellhead Equipment Engineers" class="logo footer-logo-img">
                </div>
                <p>A leading provider of cutting-edge oil and gas equipment solutions with unwavering dedication to excellence.</p>
            </div>

            <div class="footer-section">
                <h4>Services</h4>
                <ul>
                    <li><a href="services.html#wellhead">Wellhead Equipment</a></li>
                    <li><a href="services.html#pressure-vessels">Pressure Vessels</a></li>
                    <li><a href="services.html#sand-management">Sand Management</a></li>
                    <li><a href="services.html#pressure-control">Pressure Control</a></li>
                    <li><a href="services.html#storage-tanks">Storage Tanks</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Company</h4>
                <ul>
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="certification.html">Certification</a></li>
                    <li><a href="careers.html">Careers</a></li>
                    <li><a href="contact.html">Contact</a></li>
                    <li><a href="https://www.wheltd.com/wp-content/uploads/2023/10/Wellhead-Brochure.pdf" target="_blank">Download Brochure</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h4>Contact Info</h4>
                <div class="contact-info">
                    <p><strong>Email:</strong> info@wheltd.com</p>
                    <p><strong>Address:</strong><br>Q-3055, Akshar Business Park<br>Vashi, Navi Mumbai- 400 703</p>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2024 Wellhead Equipment Engineers Pvt. Ltd. All rights reserved.</p>
        </div>
    </div>
</footer>
`;

// Component loader for modular HTML structure
class ComponentLoader {
    static loadComponent(elementId, template) {
        console.log(`Loading component for element: ${elementId}`);
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = template;
            console.log(`Component loaded for: ${elementId}`);
            // Trigger any necessary re-initialization after component load
            this.initializeLoadedComponent(elementId);
        } else {
            console.error(`Element not found: ${elementId}`);
        }
    }

    static initializeLoadedComponent(elementId) {
        // Re-initialize navigation functionality if header was loaded
        if (elementId === 'header-placeholder') {
            this.initializeNavigation();
        }
    }

    static initializeNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navbar = document.getElementById('navbar');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Navbar scroll effect
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }

        // Set active nav link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const dataPage = link.getAttribute('data-page');
            const href = link.getAttribute('href');
            if (dataPage === currentPage || href === currentPage || 
                (currentPage === '' && (href === 'index.html' || dataPage === 'index.html'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    static loadAllComponents() {
        // Load header
        this.loadComponent('header-placeholder', HEADER_TEMPLATE);
        
        // Load footer
        this.loadComponent('footer-placeholder', FOOTER_TEMPLATE);
    }
}

// Auto-load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, loading components...');
    ComponentLoader.loadAllComponents();
    console.log('Components loaded');
});

// Export for use in other modules
window.ComponentLoader = ComponentLoader;