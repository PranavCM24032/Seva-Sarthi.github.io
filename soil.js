// soil.js - Complete Soil Testing Application

// Application Configuration
const CONFIG = {
    REPORT_GENERATION_TIME: 30, // seconds for demo
    AGENT_INFO: {
        name: "राजेश पाटील",
        mobile: "9876543210",
        email: "rajesh.patil@sevasarathi.com"
    }
};

// Application state
let currentUser = null;
let soilTests = [];
let updateInterval = null;
let sampleCollectionInterval = null;
let isRendering = false;

// DOM Elements
let testsContainer, bookingForm, cancelBtn, notification, testDateInput;
let totalTestsEl, pendingTestsEl, completedTestsEl, cancelledTestsEl, testsCountEl;
let newBookingBtn, testFilter;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initializing Soil Testing App...");
    initSoilApp();
});

// Load header, background and footer components
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


// Initialize navigation active states - FIXED FOR SOIL PAGE
function initializeNavigation() {
    // Wait for header to be fully loaded
    
    const checkHeaderLoaded = setInterval(() => {
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (navLinks.length > 0) {
            clearInterval(checkHeaderLoaded);
            
            const currentPage = window.location.pathname.split('/').pop() || 'soil.html';
            console.log('Current page detected:', currentPage);
            
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                
                // Remove 'active' class from all links first
                link.classList.remove('active');
                
                // Add 'active' class to current page link
                if (linkHref === currentPage) {
                    link.classList.add('active');
                }
                
                // Special handling for soil page
                if (currentPage === 'soil.html' && 
                    (linkHref === 'soil.html' || 
                     link.textContent.includes('माती') || 
                     link.textContent.includes('Soil'))) {
                    link.classList.add('active');
                }
            });
        }
    }, 100);
}

// Initialize the application
// Initialize the application
function initSoilApp() {
       loadComponents();
    console.log("🚀 Initializing Soil Testing App...");
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // REMOVE THIS LINE: initializeNavigation();
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (testDateInput) {
        testDateInput.min = tomorrow.toISOString().split('T')[0];
        testDateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Load user and data
    loadUser();
    loadSoilTests();
    setupEventListeners();
    startAutomaticUpdates();
    
    console.log("✅ Soil Testing App Initialized");
}
// Initialize the application

function initializeDOMElements() {
    testsContainer = document.getElementById('tests-container');
    bookingForm = document.getElementById('booking-form');
    cancelBtn = document.getElementById('cancel-btn');
    notification = document.getElementById('notification');
    testDateInput = document.getElementById('test_date');
    newBookingBtn = document.getElementById('newBookingBtn');
    testFilter = document.getElementById('testFilter');
    
    totalTestsEl = document.getElementById('total-tests');
    pendingTestsEl = document.getElementById('pending-tests');
    completedTestsEl = document.getElementById('completed-tests');
    cancelledTestsEl = document.getElementById('cancelled-tests');
    testsCountEl = document.getElementById('tests-count');
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // New booking button
    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', () => {
            switchTab('booking');
        });
    }
    
    // Form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            handleBookingSubmit(e);
        });
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            switchTab('tests');
        });
    }
    
    // Test filter
    if (testFilter) {
        testFilter.addEventListener('change', () => {
            renderTests();
        });
    }
}

// User management
function loadUser() {
    let sessionId = sessionStorage.getItem('soilSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('soilSessionId', sessionId);
    }
    
    currentUser = {
        id: sessionId,
        name: 'शेतकरी',
        phone: '',
        created: new Date().toISOString()
    };
}

function switchTab(tabId) {
    // Update active tab button
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.classList.remove('active-tab');
        button.classList.remove('text-green-400');
        button.classList.add('text-gray-400');
    });
    
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active-tab');
        activeButton.classList.add('text-green-400');
        activeButton.classList.remove('text-gray-400');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabId}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    if (tabId === 'tests') {
        renderTests();
    }
}

function showNotification(message, type = 'success') {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => { 
        notification.classList.remove('show'); 
    }, 3000);
}

function updateStats() {
    if (!totalTestsEl) return;
    
    const totalTests = soilTests.length;
    const pendingTests = soilTests.filter(test => 
        test.status === 'बुकिंग पूर्ण' || test.status === 'नमुना संकलित'
    ).length;
    const completedTests = soilTests.filter(test => 
        test.status === 'अहवाल तयार'
    ).length;
    const cancelledTests = soilTests.filter(test => 
        test.status === 'रद्द केलेली'
    ).length;
    
    totalTestsEl.textContent = formatNumber(totalTests);
    pendingTestsEl.textContent = formatNumber(pendingTests);
    completedTestsEl.textContent = formatNumber(completedTests);
    cancelledTestsEl.textContent = formatNumber(cancelledTests);
    
    if (testsCountEl) {
        testsCountEl.textContent = formatNumber(totalTests);
    }
}

function loadSoilTests() {
    if (currentUser) {
        const sessionData = sessionStorage.getItem(`soilTests_${currentUser.id}`);
        soilTests = sessionData ? JSON.parse(sessionData) : [];
    } else {
        soilTests = [];
    }
    updateStats();
    renderTests();
}

function saveSoilTests() {
    if (currentUser) {
        sessionStorage.setItem(`soilTests_${currentUser.id}`, JSON.stringify(soilTests));
    }
}

function renderTests() {
    if (!testsContainer || isRendering) return;
    
    isRendering = true;
    
    const filterValue = testFilter ? testFilter.value : 'all';
    let filteredTests = soilTests;
    
    // Apply filter
    if (filterValue !== 'all') {
        filteredTests = soilTests.filter(test => {
            if (filterValue === 'pending') {
                return test.status === 'बुकिंग पूर्ण' || test.status === 'नमुना संकलित';
            } else if (filterValue === 'completed') {
                return test.status === 'अहवाल तयार';
            } else if (filterValue === 'cancelled') {
                return test.status === 'रद्द केलेली';
            }
            return true;
        });
    }
    
    if (filteredTests.length === 0) {
        if (soilTests.length === 0) {
            testsContainer.innerHTML = `
                <div class="text-center py-12">
                  <span class="material-icons" style="font-size: 3rem; color: rgba(156, 163, 175, 0.8); filter: brightness(1.1) contrast(0.9);">science</span>
                    <h3 class="text-xl font-semibold text-gray-400 mb-2 marathi-text">कोणतीही तपासणी नाही</h3>
                    <p class="text-gray-400 mb-6">नवीन तपासणी बुक करण्यासाठी 'नवीन तपासणी बुक करा' टॅबवर क्लिक करा.</p>
                   
              
                
                </div>
            `;
        } else {
            testsContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <span class="material-icons text-gray-400 text-3xl">search_off</span>
                    </div>
                    <h3 class="text-xl font-semibold text-white mb-2 marathi-text">कोणतीही तपासणी सापडली नाही</h3>
                    <p class="text-gray-400">निवडलेल्या फिल्टरसाठी कोणतीही तपासणी उपलब्ध नाही.</p>
                </div>
            `;
        }
        isRendering = false;
        return;
    }
    
    let testCardsHTML = '';
    
    filteredTests.forEach(test => {
        let statusClass = {
            'बुकिंग पूर्ण': 'status-booking', 
            'नमुना संकलित': 'status-collected', 
            'अहवाल तयार': 'status-ready', 
            'रद्द केलेली': 'status-cancelled'
        }[test.status] || 'status-booking';
        
        // Timer HTML
        let timerHTML = '';
        if (test.status === "नमुना संकलित" && test.sample_collected_date) {
            const timerData = calculateTimerData(test.sample_collected_date);
            if (timerData && timerData.seconds > 0) {
                timerHTML = `
                    <div class="timer-container bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
                        <div class="flex items-center mb-3">
                            <span class="material-icons mr-2 text-yellow-400">schedule</span>
                            <span class="font-medium marathi-text text-white">अहवालासाठी उर्वरित वेळ</span>
                        </div>
                        <div class="text-center mb-4">
                            <div class="text-3xl font-bold font-mono text-yellow-300 countdown-timer">${timerData.displayTime}</div>
                            <div class="text-sm text-gray-300 mt-1 marathi-text">${timerData.seconds} सेकंद शिल्लक</div>
                        </div>
                        <div class="progress-container">
                            <div class="flex justify-between text-sm mb-2">
                                <span class="marathi-text text-gray-300">प्रगती</span>
                                <span class="marathi-text text-gray-300">${timerData.progress}% पूर्ण</span>
                            </div>
                            <div class="progress-bar bg-gray-700 rounded-full h-2">
                                <div class="progress-fill bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out" style="width: ${timerData.progress}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        let resultsHTML = '';
        if (test.status === 'अहवाल तयार') {
            resultsHTML = `
                <div class="bg-gray-800 rounded-xl p-6 mt-4">
                    <h4 class="font-semibold text-lg mb-4 text-white marathi-text">तपासणी निकाल</h4>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div class="result-item">
                            <div class="text-2xl font-bold text-white">${test.ph_level}</div>
                            <div class="text-sm text-gray-300 marathi-text">pH स्तर</div>
                        </div>
                        <div class="result-item">
                            <div class="text-2xl font-bold text-white">${test.nitrogen}</div>
                            <div class="text-sm text-gray-300 marathi-text">नायट्रोजन</div>
                        </div>
                        <div class="result-item">
                            <div class="text-2xl font-bold text-white">${test.phosphorus}</div>
                            <div class="text-sm text-gray-300 marathi-text">फॉस्फरस</div>
                        </div>
                        <div class="result-item">
                            <div class="text-2xl font-bold text-white">${test.potassium}</div>
                            <div class="text-sm text-gray-300 marathi-text">पोटॅशियम</div>
                        </div>
                        <div class="result-item">
                            <div class="text-2xl font-bold text-white">${test.organic_carbon}%</div>
                            <div class="text-sm text-gray-300 marathi-text">सेंद्रिय कार्बन</div>
                        </div>
                    </div>
                    <div class="bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded">
                        <h5 class="font-semibold text-blue-300 mb-2 marathi-text">शिफारसी</h5>
                        <p class="text-blue-200 marathi-text">${test.recommendations}</p>
                    </div>
                </div>
            `;
        }
        
        let actionButtonsHTML = '';
        if (test.status === 'बुकिंग पूर्ण') {
            actionButtonsHTML = `
                <button class="cancel-test-btn bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition duration-300 flex items-center marathi-text" data-test-id="${test.id}">
                    <span class="material-icons mr-1 text-sm">cancel</span>
                    रद्द करा
                </button>
            `;
        }
        
        if (test.status === 'अहवाल तयार') {
            actionButtonsHTML += `
                <button class="download-pdf-btn bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition duration-300 flex items-center ml-2 marathi-text" data-test-id="${test.id}">
                    <span class="material-icons mr-1 text-sm">picture_as_pdf</span>
                    PDF डाउनलोड
                </button>
            `;
        }
        
        actionButtonsHTML += `
            <button class="contact-agent-btn bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition duration-300 flex items-center ml-2 marathi-text" data-test-id="${test.id}">
                <span class="material-icons mr-1 text-sm">phone</span>
                संपर्क करा
            </button>
        `;
        
        testCardsHTML += `
        <div class="bg-black-500 bg-opacity-70 backdrop-blur-md rounded-2xl border border-gray-700">
            <div class="card rounded-2xl p-6 mb-6 scale-in" data-test-id="${test.id}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-white marathi-text">${test.farmer_name}</h3>
                        <p class="text-gray-400 text-sm marathi-text">तपासणी क्र: ${test.id}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass} marathi-text">
                        ${test.status}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">location_on</span>
                        <span class="marathi-text">${test.farmer_village}, ${test.district}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">calendar_today</span>
                        <span class="marathi-text">${formatDate(test.test_date)}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">schedule</span>
                        <span class="marathi-text">${test.test_time}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">person</span>
                        <span class="marathi-text">एजंट: ${test.agent_name}</span>
                    </div>
                </div>
                
                ${timerHTML}
                ${resultsHTML}
                
                <div class="flex flex-wrap gap-2 mt-4">
                    ${actionButtonsHTML}
                </div>
            </div>
        </div>
        `;
    });
    
    // Single DOM update to prevent flickering
    testsContainer.innerHTML = testCardsHTML;
    
    // Add event listeners after DOM is updated
    setTimeout(() => {
        document.querySelectorAll('.cancel-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testId = e.currentTarget.getAttribute('data-test-id');
                handleCancelTest(testId);
            });
        });
        
        document.querySelectorAll('.download-pdf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testId = e.currentTarget.getAttribute('data-test-id');
                downloadPDFReport(testId);
            });
        });
        
        document.querySelectorAll('.contact-agent-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testId = e.currentTarget.getAttribute('data-test-id');
                handleContactAgent(testId);
            });
        });
        
        isRendering = false;
    }, 0);
}

function downloadPDFReport(testId) {
    const test = soilTests.find(t => t.id == testId);
    if (!test) return;
    
    const pdfContent = `
        सेवा सारथी - माती तपासणी अहवाल
        =================================
        
        तपासणी क्रमांक: ${test.id}
        शेतकऱ्याचे नाव: ${test.farmer_name}
        गाव: ${test.farmer_village}
        जिल्हा: ${test.district}
        तपासणी तारीख: ${formatDate(test.test_date)}
        तपासणी वेळ: ${test.test_time}
        
        तपासणी निकाल:
        --------------
        • pH स्तर: ${test.ph_level}
        • नायट्रोजन: ${test.nitrogen}
        • फॉस्फरस: ${test.phosphorus}
        • पोटॅशियम: ${test.potassium}
        • सेंद्रिय कार्बन: ${test.organic_carbon}%
        
        शिफारसी:
        --------
        ${test.recommendations}
        
        एजंट माहिती:
        ------------
        नाव: ${test.agent_name}
        संपर्क: ${test.agent_mobile}
        ईमेल: ${test.agent_email}
        
        अहवाल तयार केल्याची तारीख: ${formatDate(test.report_generated_at || new Date().toISOString())}
        
        =================================
        सेवा सारथी - शेतकऱ्यांचा डिजिटल साथीदार
    `;
    
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `soil_test_${test.id}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📄 PDF अहवाल डाउनलोड सुरू आहे...', 'success');
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = { 
        id: 'ST' + Date.now(), 
        farmer_name: document.getElementById('farmer_name').value, 
        farmer_phone: document.getElementById('farmer_phone').value, 
        farmer_village: document.getElementById('farmer_village').value, 
        district: document.getElementById('district').value, 
        location: document.getElementById('location').value, 
        plot_number: document.getElementById('plot_number').value, 
        test_date: document.getElementById('test_date').value, 
        test_time: document.getElementById('test_time').value, 
        current_crop: document.getElementById('current_crop').value, 
        additional_info: document.getElementById('additional_info').value, 
        status: 'बुकिंग पूर्ण', 
        agent_name: CONFIG.AGENT_INFO.name,
        agent_mobile: CONFIG.AGENT_INFO.mobile,
        agent_email: CONFIG.AGENT_INFO.email,
        user_id: currentUser.id,
        sample_collected_date: null, 
        ph_level: null, 
        nitrogen: null, 
        phosphorus: null, 
        potassium: null, 
        organic_carbon: null, 
        recommendations: null,
        created_at: new Date().toISOString()
    };
    
    soilTests.unshift(formData);
    saveSoilTests();
    
    showNotification(`✅ तपासणी यशस्वीरित्या बुक केली! एजंट ${CONFIG.AGENT_INFO.name} तुमच्या निवडलेल्या तारखेला तुमच्या शेतात येईल.`);
    
    switchTab('tests');
    bookingForm.reset();
    
    // Reset date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    testDateInput.value = tomorrow.toISOString().split('T')[0];
}

function handleContactAgent(testId) {
    const test = soilTests.find(t => t.id == testId);
    if (test) {
        alert(`एजंट ${test.agent_name} यांच्याशी संपर्क साधा:\n📞 ${test.agent_mobile}\n✉️ ${test.agent_email}\n\nतपासणी क्रमांक: ${testId}`);
    }
}

function handleCancelTest(testId) {
    if (confirm('तुम्हाला खरोखर ही तपासणी रद्द करायची आहे?')) {
        const testIndex = soilTests.findIndex(test => test.id == testId);
        if (testIndex !== -1) {
            soilTests[testIndex].status = 'रद्द केलेली';
            saveSoilTests();
            updateStats();
            renderTests();
            showNotification('✅ तपासणी यशस्वीरित्या रद्द केली!', 'success');
        }
    }
}

function formatDate(dateString) { 
    return new Date(dateString).toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' }); 
}

function formatNumber(num) {
    const marathiNumerals = ['0', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(digit => marathiNumerals[parseInt(digit)]).join('');
}

function calculateTimerData(sampleCollectedDate) {
    if (!sampleCollectedDate) return null;
    
    const collectedTime = new Date(sampleCollectedDate).getTime();
    const currentTime = new Date().getTime();
    const secondsPassed = Math.floor((currentTime - collectedTime) / 1000);
    const remainingSeconds = Math.max(CONFIG.REPORT_GENERATION_TIME - secondsPassed, 0);
    
    // Don't show timer if report is ready or time is up
    if (remainingSeconds <= 0) return null;
    
    const progress = Math.min((secondsPassed / CONFIG.REPORT_GENERATION_TIME) * 100, 100);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    return { 
        seconds: remainingSeconds, 
        progress: progress.toFixed(1), 
        displayTime 
    };
}

function startAutomaticUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    if (sampleCollectionInterval) clearInterval(sampleCollectionInterval);
    
    // Update timers every second
    updateInterval = setInterval(() => {
        const hasActiveTimers = updateTestTimers();
        const needsRender = hasActiveTimers || checkActiveTimers();
        
        if (needsRender) {
            updateStats();
            renderTests();
        }
    }, 1000);
    
    // Simulate sample collection every 10 seconds
    sampleCollectionInterval = setInterval(simulateSampleCollection, 10000);
}

function checkActiveTimers() {
    const testsWithTimers = soilTests.filter(test => 
        test.status === "नमुना संकलित" && 
        test.sample_collected_date
    );
    
    return testsWithTimers.length > 0;
}

function updateTestTimers() {
    let updated = false;
    let hasActiveTimers = false;
    
    soilTests = soilTests.map(test => {
        if (test.status === "नमुना संकलित" && test.sample_collected_date) {
            const secondsPassed = Math.floor((new Date().getTime() - new Date(test.sample_collected_date).getTime()) / 1000);
            const remainingSeconds = Math.max(CONFIG.REPORT_GENERATION_TIME - secondsPassed, 0);
            
            // Mark that we have active timers
            if (remainingSeconds > 0) {
                hasActiveTimers = true;
            }
            
            if (secondsPassed >= CONFIG.REPORT_GENERATION_TIME && test.status !== "अहवाल तयार") {
                updated = true;
                
                const phLevel = (Math.random() * 1.5 + 6.2).toFixed(1);
                const n_p_k = ["कमी", "मध्यम", "जास्त"];
                
                let recommendations = "";
                if (parseFloat(phLevel) < 6.5) {
                    recommendations = "माती अम्लयुक्त आहे. चुनखडी 1-2 टन/हेक्टर वापरा. कंपोस्ट खत 5 टन/हेक्टर वापरा.";
                } else if (parseFloat(phLevel) > 7.5) {
                    recommendations = "माती क्षारयुक्त आहे. जिप्सम 1 टन/हेक्टर वापरा. सल्फरयुक्त खते प्राधान्य द्या.";
                } else {
                    recommendations = "माती संतुलित आहे. संतुलित खत वापरा. कंपोस्ट 4-5 टन/हेक्टर वापरा.";
                }
                
                return {
                    ...test,
                    status: "अहवाल तयार",
                    ph_level: phLevel,
                    nitrogen: n_p_k[Math.floor(Math.random() * 3)],
                    phosphorus: n_p_k[Math.floor(Math.random() * 3)],
                    potassium: n_p_k[Math.floor(Math.random() * 3)],
                    organic_carbon: (Math.random() * 1.2 + 0.4).toFixed(1),
                    recommendations: recommendations,
                    report_generated_at: new Date().toISOString()
                };
            }
        }
        return test;
    });
    
    if (updated) {
        saveSoilTests();
        showNotification('🎉 नवीन तपासणी अहवाल तयार झाला आहे!', 'success');
    }
    
    return hasActiveTimers || updated;
}

function simulateSampleCollection() {
    const pendingTest = soilTests.find(test => 
        test.status === "बुकिंग पूर्ण" && 
        !test.sample_collected_date
    );
    
    if (pendingTest) {
        const testIndex = soilTests.findIndex(test => test.id === pendingTest.id);
        if (testIndex !== -1) {
            soilTests[testIndex].status = "नमुना संकलित";
            soilTests[testIndex].sample_collected_date = new Date().toISOString();
            soilTests[testIndex].sample_collected_by = CONFIG.AGENT_INFO.name;
            
            saveSoilTests();
            updateStats();
            renderTests();
            
            showNotification(`🔬 नमुना संकलित! तपासणी क्र. ${pendingTest.id} साठी नमुना संकलित केला गेला आहे. अहवाल 30 सेकंदात उपलब्ध होईल.`, 'info');
        }
    }
}

// Clean up intervals when page is unloaded
window.addEventListener('beforeunload', () => {
    if (updateInterval) clearInterval(updateInterval);
    if (sampleCollectionInterval) clearInterval(sampleCollectionInterval);
});