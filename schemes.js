// schemes.js - Complete functionality with proper matching

let schemesData = [];
let savedSchemes = JSON.parse(localStorage.getItem('savedSchemes')) || [];
let currentPage = 'browse-schemes';
let previousPage = 'browse-schemes';
let currentStep = 1;

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

        // Load schemes data
        const schemesResponse = await fetch('schemes.json');
        const data = await schemesResponse.json();
        schemesData = data.schemes;
        console.log('✅ Schemes data loaded');

        initializeSchemesPage();
        addTestButtons(); // Add test buttons for dynamic testing

        console.log('All components loaded - bubbles should be running');
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Initialize schemes page
function initializeSchemesPage() {
    setupNavigationButtons();
    loadBrowseSchemes();
    setupSearch();
    console.log('✅ Schemes page initialized');
}

// Setup navigation buttons
function setupNavigationButtons() {
    const allSchemesBtn = document.getElementById('all-schemes-btn');
    const findSchemesBtn = document.getElementById('find-schemes-btn');

    allSchemesBtn.addEventListener('click', () => {
        allSchemesBtn.classList.add('active');
        findSchemesBtn.classList.remove('active');
        showPage('browse-schemes');
    });

    findSchemesBtn.addEventListener('click', () => {
        findSchemesBtn.classList.add('active');
        allSchemesBtn.classList.remove('active');
        showPage('find-schemes');
    });
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageElement = document.getElementById(`${pageId}-page`);
    pageElement.classList.remove('hidden');
    pageElement.classList.add('active');
    
    // Update navigation state
    previousPage = currentPage;
    currentPage = pageId;
    
    // Load page-specific content
    if (pageId === 'browse-schemes') {
        loadBrowseSchemes();
    } else if (pageId === 'find-schemes') {
        // Reset form to first step
        currentStep = 1;
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('step-1').classList.add('active');
        document.getElementById('form-progress').style.width = '20%';
    }
}

function goBack() {
    showPage(previousPage);
}

// Form navigation functions
function nextFormStep(nextStep) {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Show next step
    document.getElementById(`step-${nextStep}`).classList.add('active');
    
    // Update progress bar
    const progressPercentage = (nextStep - 1) * 20;
    document.getElementById('form-progress').style.width = `${progressPercentage}%`;
    
    // Update current step
    currentStep = nextStep;
}

function prevFormStep(prevStep) {
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Show previous step
    document.getElementById(`step-${prevStep}`).classList.add('active');
    
    // Update progress bar
    const progressPercentage = (prevStep - 1) * 20;
    document.getElementById('form-progress').style.width = `${progressPercentage}%`;
    
    // Update current step
    currentStep = prevStep;
}

function validateStep(step) {
    // Simple validation for demonstration
    if (step === 1) {
        const name = document.getElementById('farmer_name').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const mobile = document.getElementById('mobile').value;
        
        if (!name || !age || !gender || !mobile) {
            alert('कृपया सर्व आवश्यक फील्ड भरा');
            return false;
        }
    }
    
    return true;
}

// Load browse schemes page
function loadBrowseSchemes() {
    const container = document.getElementById('schemes-grid');
    container.innerHTML = '';
    
    schemesData.forEach(scheme => {
        const isSaved = savedSchemes.includes(scheme.id);
        container.innerHTML += createSchemeCard(scheme, isSaved);
    });

    // Add search functionality
    const searchInput = document.getElementById('schemeSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterSchemes(this.value);
        });
    }
}

// Filter schemes based on search input
function filterSchemes(searchTerm) {
    const container = document.getElementById('schemes-grid');
    container.innerHTML = '';
    
    const filteredSchemes = schemesData.filter(scheme => {
        return scheme.name_marathi.toLowerCase().includes(searchTerm.toLowerCase()) ||
               scheme.name_english.toLowerCase().includes(searchTerm.toLowerCase()) ||
               scheme.description_marathi.toLowerCase().includes(searchTerm.toLowerCase()) ||
               scheme.category.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    if (filteredSchemes.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-gray-400 text-6xl mb-4"></i>
                <h4 class="text-xl font-semibold text-gray-400 mt-4">कोणतीही योजना सापडली नाही</h4>
                <p class="text-gray-500">कृपया वेगळे शोधशब्द वापरून पहा</p>
            </div>
        `;
    } else {
        filteredSchemes.forEach(scheme => {
            const isSaved = savedSchemes.includes(scheme.id);
            container.innerHTML += createSchemeCard(scheme, isSaved);
        });
    }
}

// Create scheme card HTML
function createSchemeCard(scheme, isSaved) {
    return `
        <div class="scheme-card card rounded-2xl overflow-hidden">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <span class="bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                        ${scheme.category}
                    </span>
                    <button onclick="toggleSaveScheme(${scheme.id})" class="text-${isSaved ? 'green-300' : 'gray-400'} hover:text-green-300">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">${scheme.name_marathi}</h3>
                <p class="text-gray-300 text-sm mb-4">${scheme.description_marathi}</p>
                
                <div class="flex items-center justify-between mt-4">
                    <span class="text-sm text-purple-300">${scheme.benefit_amount}</span>
                    <button onclick="showSchemeDetails(${scheme.id})" class="text-purple-300 hover:text-green-100 text-sm font-medium">
                        अधिक माहिती <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle save scheme
function toggleSaveScheme(schemeId) {
    if (savedSchemes.includes(schemeId)) {
        savedSchemes = savedSchemes.filter(id => id !== schemeId);
    } else {
        savedSchemes.push(schemeId);
    }
    
    localStorage.setItem('savedSchemes', JSON.stringify(savedSchemes));
    
    // Reload current page if needed
    if (currentPage === 'browse-schemes') {
        loadBrowseSchemes();
    }
}

// Show scheme details
function showSchemeDetails(schemeId) {
    const scheme = schemesData.find(s => s.id === schemeId);
    if (!scheme) return;
    
    const container = document.getElementById('scheme-details-content');
    const isSaved = savedSchemes.includes(schemeId);
    
    container.innerHTML = `
        <div class="card rounded-2xl overflow-hidden">
            <div class="p-6">
                <div class="flex justify-between items-start gap-4 mb-4">
                    <div class="flex-1">
                        <div class="flex flex-wrap gap-2 mb-3">
                            <span class="bg-green-600 text-white text-sm font-medium px-3 py-1 rounded">
                                ${scheme.category}
                            </span>
                            ${scheme.benefit_amount ? `
                                <span class="border border-gray-300 text-gray-300 text-sm font-medium px-3 py-1 rounded flex items-center gap-1">
                                    <i class="fas fa-rupee-sign w-3 h-3"></i>
                                    ${scheme.benefit_amount}
                                </span>
                            ` : ''}
                        </div>
                        <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">${scheme.name_marathi}</h2>
                        <p class="text-lg text-gray-300">${scheme.name_english}</p>
                    </div>
                    <button onclick="toggleSaveScheme(${scheme.id})" class="p-2 rounded-lg ${isSaved ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-300'}">
                        <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}"></i>
                    </button>
                </div>
                
                ${scheme.application_link ? `
                    <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-6">
                        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-bold mb-1">या योजनेसाठी अर्ज करा</h3>
                                <p class="text-green-100 text-sm">थेट ऑनलाइन अर्ज करण्यासाठी खालील बटण दाबा</p>
                            </div>
                            <a href="${scheme.application_link}" target="_blank" class="shrink-0">
                                <button class="bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg flex items-center gap-2">
                                    <i class="fas fa-paper-plane w-5 h-5"></i>
                                    आता अर्ज करा
                                </button>
                            </a>
                        </div>
                    </div>
                ` : ''}
                
                <div class="mb-6">
                    <h3 class="font-semibold text-lg mb-2 text-white">योजनेचा तपशील</h3>
                    <p class="text-gray-300">${scheme.description_marathi}</p>
                </div>
                
                <div class="border-t border-gray-600 pt-6 mb-6">
                    <h3 class="font-semibold text-lg mb-3 text-white">योजनेचे फायदे</h3>
                    <p class="text-gray-300">${scheme.benefits_marathi}</p>
                </div>
                
                <div class="border-t border-gray-600 pt-6 mb-6">
                    <h3 class="font-semibold text-lg mb-3 text-white">पात्रता निकष</h3>
                    <p class="text-gray-300">${scheme.eligibility_marathi}</p>
                    
                    <div class="grid md:grid-cols-2 gap-4 mt-4">
                        ${scheme.age_min ? `
                            <div class="flex items-center gap-2">
                                <i class="fas fa-users text-gray-400 w-4 h-4"></i>
                                <span class="text-sm text-gray-300">वय: ${scheme.age_min} - ${scheme.age_max || '∞'} वर्षे</span>
                            </div>
                        ` : ''}
                        ${scheme.income_max ? `
                            <div class="flex items-center gap-2">
                                <i class="fas fa-rupee-sign text-gray-400 w-4 h-4"></i>
                                <span class="text-sm text-gray-300">कमाल उत्पन्न: ₹${scheme.income_max}</span>
                            </div>
                        ` : ''}
                        ${scheme.gender && scheme.gender !== "सर्व" ? `
                            <div class="flex items-center gap-2">
                                <i class="fas fa-users text-gray-400 w-4 h-4"></i>
                                <span class="text-sm text-gray-300">लिंग: ${scheme.gender}</span>
                            </div>
                        ` : ''}
                        ${scheme.states_applicable && scheme.states_applicable.length > 0 ? `
                            <div class="flex items-center gap-2">
                                <i class="fas fa-map-marker-alt text-gray-400 w-4 h-4"></i>
                                <span class="text-sm text-gray-300">राज्ये: ${scheme.states_applicable.join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${scheme.required_documents && scheme.required_documents.length > 0 ? `
                    <div class="border-t border-gray-600 pt-6 mb-6">
                        <h3 class="font-semibold text-lg mb-3 text-white">आवश्यक कागदपत्रे</h3>
                        <ul class="space-y-2">
                            ${scheme.required_documents.map(doc => `
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                    <span class="text-gray-300">${doc}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${scheme.application_process ? `
                    <div class="border-t border-gray-600 pt-6 mb-6">
                        <h3 class="font-semibold text-lg mb-3 text-white">अर्ज प्रक्रिया</h3>
                        <p class="text-gray-300">${scheme.application_process}</p>
                    </div>
                ` : ''}
                
                <div class="border-t border-gray-600 pt-6">
                    <div class="flex flex-col sm:flex-row gap-4">
                        ${scheme.official_website ? `
                            <a href="${scheme.official_website}" target="_blank" class="flex-1">
                                <button class="w-full border border-gray-300 text-gray-300 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                                    <i class="fas fa-external-link-alt w-4 h-4"></i>
                                    अधिकृत संकेतस्थळ
                                </button>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showPage('scheme-details');
}

// Submit profile form and find matching schemes
function submitProfileForm() {
    // Validate final step
    if (!validateStep(currentStep)) {
        return;
    }

    // Get user profile data
    const userProfile = {
        name: document.getElementById('farmer_name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        state: document.getElementById('state').value,
        district: document.getElementById('district').value,
        landArea: parseFloat(document.getElementById('total_land_area').value) || 0,
        mainCrop: document.getElementById('main_crop').value,
        annualIncome: parseInt(document.getElementById('annual_income').value) || 0,
        activities: Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value)
    };

    // Show loading state
    showPage('results');
    document.getElementById('results-container').innerHTML = `
        <div class="card rounded-2xl p-8 text-center">
            <div class="loading-spinner mx-auto mb-3 w-8 h-8 border-2 border-green-300 border-t-transparent rounded-full"></div>
            <h3 class="font-semibold text-white mb-1">आपल्या योजना शोधत आहे...</h3>
            <p class="text-gray-300 text-sm">कृपया थोडा वेळ थांबा</p>
        </div>
    `;

    // Simulate API call delay
    setTimeout(() => {
        // Generate and display results based on user profile
        generateResults(userProfile);
    }, 2000);
}

// FIXED MATCHING ALGORITHM - Strict filtering
function generateResults(userProfile) {
    console.log('🎯 User Profile:', userProfile);
    
    const matchedSchemes = schemesData.map(scheme => {
        let score = 0;
        let matchReasons = [];
        let criticalFailures = 0;

        // 1. STATE MATCHING - CRITICAL (40 points)
        if (scheme.states_applicable && scheme.states_applicable.length > 0) {
            if (scheme.states_applicable.includes("सर्व") || 
                scheme.states_applicable.includes(userProfile.state)) {
                score += 40;
                matchReasons.push(`राज्य: ${userProfile.state}`);
            } else {
                criticalFailures++;
                score -= 30; // Very heavy penalty for wrong state
            }
        }

        // 2. LAND MATCHING - VERY IMPORTANT (30 points)
        if (scheme.land_required) {
            if (userProfile.landArea > 0.5) { // At least 0.5 hectares
                score += 30;
                matchReasons.push(`जमीन: ${userProfile.landArea} हेक्टर`);
            } else {
                criticalFailures++;
                score -= 25; // Very heavy penalty for missing land
            }
        } else {
            // No land requirement - give partial points
            score += 15;
        }

        // 3. AGE MATCHING - IMPORTANT (20 points)
        if (scheme.age_min) {
            if (userProfile.age >= scheme.age_min) {
                if (scheme.age_max && userProfile.age > scheme.age_max) {
                    criticalFailures++;
                    score -= 10; // Penalty for age over max
                } else {
                    score += 20;
                    matchReasons.push(`वय: ${userProfile.age} वर्षे`);
                }
            } else {
                criticalFailures++;
                score -= 15; // Penalty for underage
            }
        } else {
            // No age requirement
            score += 10;
        }

        // 4. ACTIVITY MATCHING - BONUS (10 points)
        if (userProfile.activities && userProfile.activities.length > 0) {
            let activityMatched = false;
            
            // Smart activity matching
            const activityMap = {
                'पशुपालन': ['पशुधन'],
                'मत्स्यपालन': ['मत्स्यपालन'],
                'डेअरी व्यवसाय': ['पशुधन'],
                'बागायती': ['हॉर्टिकल्चर'],
                'सेंद्रिय शेती': ['सेंद्रिय']
            };

            userProfile.activities.forEach(activity => {
                if (activityMap[activity]) {
                    const hasMatch = activityMap[activity].some(term => 
                        scheme.category.includes(term)
                    );
                    if (hasMatch) {
                        activityMatched = true;
                        matchReasons.push(`उपक्रम: ${activity}`);
                    }
                }
            });

            if (activityMatched) {
                score += 10;
            }
        }

        // 5. INCOME MATCHING (10 points)
        if (scheme.income_max) {
            if (userProfile.annualIncome <= scheme.income_max) {
                score += 10;
                matchReasons.push(`उत्पन्न: ₹${userProfile.annualIncome}`);
            } else {
                criticalFailures++;
                score -= 5; // Penalty for income over limit
            }
        } else {
            // No income requirement
            score += 5;
        }

        // Ensure score is between 0-100
        const matchPercentage = Math.max(0, Math.min(100, Math.round(score)));

        console.log(`Scheme: ${scheme.name_marathi}, Score: ${score}, Critical Failures: ${criticalFailures}`);

        return {
            ...scheme,
            match_percentage: matchPercentage,
            match_score: score,
            match_reasons: matchReasons,
            critical_failures: criticalFailures
        };
    })
    // STRICT FILTERING - Only show good matches
    .filter(scheme => {
        // Must have at least 60% score AND no more than 1 critical failure
        return scheme.match_percentage >= 60 && scheme.critical_failures <= 1;
    })
    .sort((a, b) => b.match_percentage - a.match_percentage);

    console.log(`✅ Found ${matchedSchemes.length} matching schemes out of ${schemesData.length}`);
    
    // Debug info
    console.log('📊 All schemes scores:', schemesData.map(s => ({
        name: s.name_marathi,
        score: s.match_percentage,
        failures: s.critical_failures
    })));

    displayResults(matchedSchemes, userProfile);
}

// Debug function to see why schemes match
function debugMatching(userProfile) {
    console.log('🔍 DEBUG MATCHING ANALYSIS');
    console.log('User Profile:', userProfile);
    
    schemesData.forEach(scheme => {
        console.log(`--- ${scheme.name_marathi} ---`);
        console.log('State match:', scheme.states_applicable.includes(userProfile.state) || scheme.states_applicable.includes("सर्व"));
        console.log('Land required:', scheme.land_required);
        console.log('User has land:', userProfile.landArea > 0);
        console.log('Age match:', userProfile.age >= scheme.age_min);
        console.log('---');
    });
}

// Separate function to display results
function displayResults(matchedSchemes, userProfile) {
    // Update match count
    document.getElementById('match-count').textContent = matchedSchemes.length;

    // Clear previous results
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    // Add matched schemes to results
    if (matchedSchemes.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-search text-gray-400 text-6xl mb-4"></i>
                <h4 class="text-xl font-semibold text-gray-400 mt-4">तुमच्या प्रोफाइलशी जुळणारी योजना सापडली नाही</h4>
                <p class="text-gray-500 mb-4">खालील टिप्स वापरून पुन्हा प्रयत्न करा:</p>
                <div class="text-sm text-gray-400 mt-4 bg-black bg-opacity-50 p-4 rounded-lg max-w-2xl mx-auto">
                    <p class="font-semibold mb-2">यशस्वी योजना शोधण्यासाठी:</p>
                    <ul class="text-left space-y-1">
                        <li>• <strong>राज्य</strong> योग्यरित्या निवडा (उदा. महाराष्ट्र)</li>
                        <li>• <strong>जमीन क्षेत्र</strong> भरा (उदा. 2.5 हेक्टर) - जास्तीत जास्त योजनांसाठी</li>
                        <li>• <strong>इतर उपक्रम</strong> निवडा (पशुपालन, बागायती इ.)</li>
                        <li>• <strong>वय</strong> 18 वर्षांपेक्षा जास्त असावे</li>
                        <li>• <strong>उत्पन्न</strong> भरा - काही योजनांसाठी महत्वाचे</li>
                    </ul>
                    ${userProfile ? `
                    <div class="mt-3 p-2 bg-gray-800 rounded">
                        <p class="font-semibold">तुमची प्रोफाइल:</p>
                        <p>राज्य: ${userProfile.state || 'निवडले नाही'}, जमीन: ${userProfile.landArea || 0} हेक्टर, उपक्रम: ${userProfile.activities ? userProfile.activities.join(', ') : 'कोणतेही नाही'}</p>
                    </div>
                    ` : ''}
                </div>
                <button onclick="showPage('find-schemes')" class="btn-primary py-2 px-6 mt-4">
                    पुन्हा प्रयत्न करा
                </button>
            </div>
        `;
    } else {
        matchedSchemes.forEach(scheme => {
            const isSaved = savedSchemes.includes(scheme.id);
            let matchClass = 'high-match';
            let progressColor = '#10b981'; // green
            
            if (scheme.match_percentage < 70) {
                matchClass = 'medium-match';
                progressColor = '#f59e0b'; // yellow
            } 
            if (scheme.match_percentage < 50) {
                matchClass = 'low-match';
                progressColor = '#ef4444'; // red
            }

            const schemeCard = document.createElement('div');
            schemeCard.className = 'scheme-card card rounded-2xl p-6';
            schemeCard.innerHTML = `
                <div class="flex flex-col md:flex-row md:items-start justify-between mb-4">
                    <div class="mb-4 md:mb-0 flex-1">
                        <h3 class="text-xl font-semibold text-white mb-1">${scheme.name_marathi}</h3>
                        <p class="text-gray-300">${scheme.name_english}</p>
                        ${scheme.match_reasons && scheme.match_reasons.length > 0 ? `
                            <div class="mt-2 text-xs text-gray-400">
                                <strong>जुळणीची कारणे:</strong> ${scheme.match_reasons.slice(0, 3).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="text-center flex flex-col items-center ml-4">
                        <div class="circular-progress" style="background: conic-gradient(${progressColor} ${scheme.match_percentage * 3.6}deg, #e5e7eb 0deg);">
                            <div class="progress-value ${matchClass}">${scheme.match_percentage}%</div>
                        </div>
                        <div class="progress-text">जुळणी</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <p class="text-gray-300">${scheme.description_marathi}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h4 class="font-semibold text-gray-300 mb-1">लाभ</h4>
                        <p class="text-white text-sm">${scheme.benefits_marathi}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-300 mb-1">पात्रता</h4>
                        <p class="text-white text-sm">${scheme.eligibility_marathi}</p>
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick="showSchemeDetails(${scheme.id})" class="btn-primary text-white text-center font-medium py-3 px-6 rounded-lg transition flex-1">
                        <i class="fas fa-info-circle mr-2"></i>
                        अधिक माहिती
                    </button>
                    ${scheme.application_link ? `
                    <a href="${scheme.application_link}" target="_blank" class="border border-green-600 text-green-300 hover:bg-green-600 hover:text-white font-medium py-3 px-6 rounded-lg transition flex-1 text-center">
                        <i class="fas fa-link mr-2"></i>
                        अर्ज करा
                    </a>
                    ` : ''}
                </div>
            `;
            
            resultsContainer.appendChild(schemeCard);
        });
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('schemeSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterSchemes(this.value);
        });
    }
}

// DYNAMIC TESTING FUNCTIONS
// function addTestButtons() {
//     const testDiv = document.createElement('div');
//     testDiv.innerHTML = `
//         <div style="position: fixed; top: 100px; right: 20px; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 10px; z-index: 1000; border: 2px solid #22c55e;">
//             <h3 style="color: white; margin-bottom: 10px; text-align: center;">🧪 डायनॅमिक टेस्ट</h3>
//             <button onclick="testAnyInput()" style="background: #22c55e; color: white; border: none; padding: 8px 12px; border-radius: 5px; margin: 5px; cursor: pointer; width: 100%;">
//                 🎲 यादृच्छिक टेस्ट
//             </button>
//             <button onclick="testGoodProfile()" style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 5px; margin: 5px; cursor: pointer; width: 100%;">
//                 ✅ चांगली प्रोफाइल
//             </button>
//             <button onclick="testBadProfile()" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 5px; margin: 5px; cursor: pointer; width: 100%;">
//                 ❌ वाईट प्रोफाइल
//             </button>
//         </div>
//     `;
//     document.body.appendChild(testDiv);
// }

// DYNAMIC TEST FUNCTION - Test any input easily
function testAnyInput() {
    // Get random test inputs
    const states = ["महाराष्ट्र", "गुजरात", "कर्नाटक", "तमिळनाडू", "उत्तर प्रदेश"];
    const activitiesList = ["पशुपालन", "मत्स्यपालन", "बागायती", "सेंद्रिय शेती", "डेअरी व्यवसाय"];
    
    const randomProfile = {
        name: "यादृच्छिक प्रोफाइल",
        state: states[Math.floor(Math.random() * states.length)],
        landArea: Math.random() > 0.3 ? (Math.random() * 5).toFixed(1) : 0, // 30% chance no land
        age: 18 + Math.floor(Math.random() * 40),
        activities: Math.random() > 0.4 ? [activitiesList[Math.floor(Math.random() * activitiesList.length)]] : [] // 60% chance has activities
    };

    console.log('🎲 Testing Random Input:', randomProfile);
    showPage('results');
    document.getElementById('results-container').innerHTML = `
        <div class="card rounded-2xl p-8 text-center">
            <div class="loading-spinner mx-auto mb-3 w-8 h-8 border-2 border-green-300 border-t-transparent rounded-full"></div>
            <h3 class="font-semibold text-white mb-1">यादृच्छिक प्रोफाइल तपासत आहे...</h3>
            <p class="text-gray-300 text-sm">कृपया थोडा वेळ थांबा</p>
        </div>
    `;
    
    setTimeout(() => {
        generateResults(randomProfile);
    }, 1500);
}

// Test profiles
function testGoodProfile() {
    const goodProfile = {
        state: "महाराष्ट्र",
        landArea: 3.5,
        age: 35,
        activities: ["पशुपालन", "बागायती"]
    };
    console.log('✅ Testing Good Profile:', goodProfile);
    showPage('results');
    document.getElementById('results-container').innerHTML = `
        <div class="card rounded-2xl p-8 text-center">
            <div class="loading-spinner mx-auto mb-3 w-8 h-8 border-2 border-green-300 border-t-transparent rounded-full"></div>
            <h3 class="font-semibold text-white mb-1">चांगली प्रोफाइल तपासत आहे...</h3>
            <p class="text-gray-300 text-sm">कृपया थोडा वेळ थांबा</p>
        </div>
    `;
    
    setTimeout(() => {
        generateResults(goodProfile);
    }, 1500);
}

function testBadProfile() {
    const badProfile = {
        state: "उत्तर प्रदेश", // Wrong state for most schemes
        landArea: 0,
        age: 17, // Underage
        activities: []
    };
    console.log('❌ Testing Bad Profile:', badProfile);
    showPage('results');
    document.getElementById('results-container').innerHTML = `
        <div class="card rounded-2xl p-8 text-center">
            <div class="loading-spinner mx-auto mb-3 w-8 h-8 border-2 border-green-300 border-t-transparent rounded-full"></div>
            <h3 class="font-semibold text-white mb-1">वाईट प्रोफाइल तपासत आहे...</h3>
            <p class="text-gray-300 text-sm">कृपया थोडा वेळ थांबा</p>
        </div>
    `;
    
    setTimeout(() => {
        generateResults(badProfile);
    }, 1500);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}