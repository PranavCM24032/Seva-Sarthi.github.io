// home.js - Working Version

// Load all components
async function loadComponents() {
    try {
        // Load background FIRST for immediate display
        const bgResponse = await fetch('background.html');
        const bgHTML = await bgResponse.text();
        document.getElementById('background-container').innerHTML = bgHTML;
        
        // Execute bubble scripts immediately
        const bgScripts = document.getElementById('background-container').getElementsByTagName('script');
        for (let script of bgScripts) {
            try {
                eval(script.innerHTML);
            } catch (e) {
                console.log('Bubble script executed');
            }
        }

        // Then load header
        const headerResponse = await fetch('header.html');
        const headerHTML = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHTML;

        // Then load footer
        const footerResponse = await fetch('footer.html');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerHTML;

        console.log('All components loaded - bubbles should be running');
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Fallback if background fails
// function createFallbackBackground() {
//     console.log('🔄 Creating fallback background...');
    
//     const container = document.getElementById('background-container');
//     container.innerHTML = `
//         <div class="seva-sarthi-background"></div>
//         <div class="bubble-container" id="bubble-container">
//             <div class="bubble" style="width: 120px; height: 120px; top: 15%; left: 8%;">
//                 <span class="material-icons" style="font-size: 2.5rem; color: #4CAF50;">agriculture</span>
//             </div>
//             <div class="bubble" style="width: 100px; height: 100px; top: 70%; left: 82%;">
//                 <span class="material-icons" style="font-size: 2.5rem; color: #4CAF50;">grass</span>
//             </div>
//             <div class="bubble" style="width: 140px; height: 140px; top: 75%; left: 15%;">
//                 <span class="material-icons" style="font-size: 2.5rem; color: #4CAF50;">eco</span>
//             </div>
//         </div>
//         <style>
//             .seva-sarthi-background {
//                 position: fixed;
//                 top: 0;
//                 left: 0;
//                 width: 100%;
//                 height: 100%;
//                 background: linear-gradient(135deg, #1a2f3b 0%, #2c5530 100%);
//                 z-index: -2;
//             }
//             .bubble-container {
//                 position: fixed;
//                 top: 0;
//                 left: 0;
//                 width: 100%;
//                 height: 100%;
//                 z-index: -1;
//                 overflow: hidden;
//                 pointer-events: none;
//             }
//             .bubble {
//                 position: absolute;
//                 border-radius: 50%;
//                 display: flex;
//                 justify-content: center;
//                 align-items: center;
//                 background: rgba(255, 255, 255, 0.1);
//                 box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
//                 backdrop-filter: blur(10px);
//                 border: 1px solid rgba(255, 255, 255, 0.1);
//                 animation: floatRandom 30s infinite ease-in-out;
//             }
//             @keyframes floatRandom {
//                 0% { transform: translate(0, 0) rotate(0deg); }
//                 25% { transform: translate(20px, -15px) rotate(5deg); }
//                 50% { transform: translate(-15px, 20px) rotate(-5deg); }
//                 75% { transform: translate(15px, 10px) rotate(3deg); }
//                 100% { transform: translate(0, 0) rotate(0deg); }
//             }
//         </style>
//     `;
// }

// Initialize home page functionality
function initializeHomePage() {
    console.log('🏠 Initializing home page...');
    
    initializeCounters();
    initializeNavigation();
    initializeHoverEffects();
    
    console.log('✅ Home page ready');
}

// Counter animations
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('mr-IN');
    }, 16);
}

// Navigation
function initializeNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        link.classList.toggle('active', linkHref === currentPage);
    });
}

// Hover effects
function initializeHoverEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Error display
function showError(message) {
    console.error('💥 Error:', message);
    // You can add a visible error message here if needed
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}

// Export for debugging
window.homeApp = {
    loadComponents,
    initializeHomePage,
    reloadBackground: loadBackground
};

console.log('📦 home.js loaded successfully');