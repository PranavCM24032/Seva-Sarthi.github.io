// Load components when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadComponents();
    initializeWeatherPage();
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

// Initialize weather page functionality
// Initialize weather page functionality
function initializeWeatherPage() {
    initializeWeatherApp();
    // REMOVE THIS LINE: initializeNavigation();
}

// Initialize navigation active states
// Initialize navigation active states
function initializeNavigation() {
    // Wait a bit for header to fully load
    setTimeout(() => {
        const currentPage = window.location.pathname.split('/').pop() || 'weather.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        console.log('Current page:', currentPage);
        console.log('Found nav links:', navLinks.length);
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            console.log('Link href:', linkHref);
            
            if (linkHref === currentPage) {
                link.classList.add('active');
                console.log('Active class added to:', linkHref);
            } else {
                link.classList.remove('active');
            }
        });
    }, 100);
}
// WEATHER APP FUNCTIONALITY - All original functionality preserved
function initializeWeatherApp() {
    // Initialize libraries
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // API configuration
    const API_KEY = 'f4d6848eb3a488816cecbd2392d8a108';
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';
    const units = "metric";

    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const currentWeather = document.getElementById('current-weather');
    const forecastContainer = document.getElementById('forecast-container');
    const currentDateElement = document.getElementById('current-date');

    // Marathi day names
    const marathiDays = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

    // Marathi month names
    const marathiMonths = [
        'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल',
        'मे', 'जून', 'जुलै', 'ऑगस्ट',
        'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
    ];

    // Weather icons mapping
    const weatherIcons = {
        '01d': 'sun',
        '01n': 'moon',
        '02d': 'cloud-sun',
        '02n': 'cloud-moon',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloud',
        '04n': 'cloud',
        '09d': 'cloud-rain',
        '09n': 'cloud-rain',
        '10d': 'cloud-sun-rain',
        '10n': 'cloud-moon-rain',
        '11d': 'cloud-bolt',
        '11n': 'cloud-bolt',
        '13d': 'snowflake',
        '13n': 'snowflake',
        '50d': 'wind',
        '50n': 'wind'
    };

    // UV index levels
    const uvIndexLevels = [
        { max: 2, class: 'uv-low', label: 'कमी' },
        { max: 5, class: 'uv-moderate', label: 'मध्यम' },
        { max: 7, class: 'uv-high', label: 'उच्च' },
        { max: 10, class: 'uv-very-high', label: 'खूप उच्च' },
        { max: Infinity, class: 'uv-extreme', label: 'अत्यंत' }
    ];

    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Initialize with default location
    getWeatherData('Pune');

    // Handle search functionality
    function handleSearch() {
        const location = searchInput.value.trim();
        if (location) {
            getWeatherData(location);
        }
    }

    // Get weather data from API
    async function getWeatherData(location) {
        showLoading();
        hideError();

        try {
            // Get coordinates first
            const geoResponse = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`
            );

            const geoData = await geoResponse.json();

            if (!geoData || geoData.length === 0) {
                throw new Error('Location not found');
            }

            const { lat, lon, name, state, country } = geoData[0];

            // Get current weather
            const currentResponse = await fetch(
                `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
            );

            if (!currentResponse.ok) {
                throw new Error('Weather data not available');
            }

            const currentData = await currentResponse.json();

            // Get forecast
            const forecastResponse = await fetch(
                `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
            );

            if (!forecastResponse.ok) {
                throw new Error('Forecast data not available');
            }

            const forecastData = await forecastResponse.json();

            // Update UI with data
            updateCurrentWeather(currentData, name, state, country);
            updateForecast(forecastData);
            updateWeatherDetails(currentData);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            showError();
        } finally {
            hideLoading();
        }
    }

    // Update current weather section
    function updateCurrentWeather(data, name, state, country) {
        // Update current date based on API response (not local time)
        const currentDate = new Date(data.dt * 1000);
        updateCurrentDate(currentDate);

        document.getElementById('location').textContent = `${name}${state ? ', ' + state : ''}, ${country}`;
        document.getElementById('weather-description').textContent = data.weather[0].description;
        document.getElementById('current-temp').textContent = `${convertToMarathiNumerals(Math.round(data.main.temp))}°C`;
        document.getElementById('humidity').textContent = `${convertToMarathiNumerals(data.main.humidity)}%`;
        document.getElementById('wind-speed').textContent = `${convertToMarathiNumerals(Math.round(data.wind.speed * 3.6))} किमी/ता`;

        // Update weather icon
        const iconCode = data.weather[0].icon;
        const iconElement = document.getElementById('current-weather-icon');
        iconElement.innerHTML = `<i class="fas fa-${weatherIcons[iconCode] || 'cloud'} text-yellow-400"></i>`;

        // For demo purposes, using a fixed UV index (real implementation would need UV API)
        const uvIndex = Math.floor(Math.random() * 11);
        const uvLevel = uvIndexLevels.find(level => uvIndex <= level.max);
        const uvElement = document.getElementById('uv-index');
        uvElement.textContent = uvLevel.label;
        uvElement.className = `px-3 py-1 rounded-full text-white ${uvLevel.class} inline-block marathi-text`;
    }

    // Update current date display based on API data
    function updateCurrentDate(date) {
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        const marathiDate = `आज, ${convertToMarathiNumerals(day)} ${marathiMonths[month]} ${convertToMarathiNumerals(year)}`;
        currentDateElement.textContent = marathiDate;
    }

    // Update forecast section
    function updateForecast(data) {
        forecastContainer.innerHTML = '';

        // Get today's date string to correctly filter out today's forecasts
        const todayString = new Date().toDateString();
        const processedDates = new Set();
        const uniqueDays = [];

        for (const forecast of data.list) {
            const forecastDate = new Date(forecast.dt * 1000);
            const forecastDateString = forecastDate.toDateString();

            // Condition: Is it a future day AND have we not already processed this day?
            if (forecastDateString !== todayString && !processedDates.has(forecastDateString)) {
                processedDates.add(forecastDateString);
                uniqueDays.push({
                    date: forecastDate,
                    forecast: forecast
                });
            }
            
            // Stop when we have 5 days of forecast
            if (uniqueDays.length >= 5) {
                break;
            }
        }

        // Create forecast cards
        uniqueDays.forEach((dayData, index) => {
            const date = dayData.date;
            const forecast = dayData.forecast;
            const dayName = getMarathiDayName(date, index);
            const dateString = formatMarathiDate(date);
            const iconCode = forecast.weather[0].icon;
            const temp = Math.round(forecast.main.temp);
            const humidity = forecast.main.humidity;
            const windSpeed = Math.round(forecast.wind.speed * 3.6);

            // Random UV index for demo
            const uvIndex = Math.floor(Math.random() * 11);
            const uvLevel = uvIndexLevels.find(level => uvIndex <= level.max);

            const forecastCard = document.createElement('div');
            forecastCard.className = 'weather-card p-4 text-center scale-in transition-all duration-300';
            forecastCard.setAttribute('data-aos', 'fade-up');
            forecastCard.setAttribute('data-aos-delay', (index + 1) * 100);

            forecastCard.innerHTML = `
  <div class="bg-black bg-opacity-30 backdrop-blur-md rounded-2xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300">
    <h4 class="font-semibold text-lg mb-1 forecast-day text-white marathi-text">${dayName}</h4>
    <center><p class="forecast-date text-gray-300 marathi-text">${dateString}</p></center>
    <div class="forecast-icon my-3">
        <i class="fas fa-${weatherIcons[iconCode] || 'cloud'} text-3xl text-yellow-400"></i>
    </div>
    <div class="forecast-temp mb-3">
        <span class="text-2xl font-bold text-white marathi-text">${convertToMarathiNumerals(temp)}°C</span>
    </div>
    <div class="space-y-2 text-sm">
        <div class="flex justify-between">
            <span class="text-gray-300 marathi-text">आर्द्रता:</span>
            <span class="text-white marathi-text">${convertToMarathiNumerals(humidity)}%</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-300 marathi-text">वारा:</span>
            <span class="text-white marathi-text">${convertToMarathiNumerals(windSpeed)} किमी/ता</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-gray-300 marathi-text">UV:</span>
            <span class="px-2 py-1 rounded-full text-white text-xs ${uvLevel.class} marathi-text">${uvLevel.label}</span>
        </div>
    </div>
</div>
            `;

            forecastContainer.appendChild(forecastCard);
        });

        // Reinitialize animations for new elements
        AOS.refresh();
    }

    // Format date in Marathi
    function formatMarathiDate(date) {
        const day = date.getDate();
        const month = marathiMonths[date.getMonth()];
        return `${convertToMarathiNumerals(day)} ${month}`;
    }

    // Get Marathi day name based on date
    function getMarathiDayName(date, index) {
        // For the first day, show "उद्या" (tomorrow)
        if (index === 0) return 'उद्या';

        // For other days, return the actual day name in Marathi
        const dayIndex = date.getDay();
        return marathiDays[dayIndex];
    }

    // Convert numbers to Marathi numerals
    function convertToMarathiNumerals(num) {
        const marathiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return num.toString().split('').map(digit => marathiNumerals[parseInt(digit, 10)]).join('');
    }

    // Update additional weather details
    function updateWeatherDetails(data) {
        document.getElementById('feels-like').textContent = `${convertToMarathiNumerals(Math.round(data.main.feels_like))}°C`;
        document.getElementById('dew-point').textContent = `${convertToMarathiNumerals(Math.round(calculateDewPoint(data.main.temp, data.main.humidity)))}°C`;
        document.getElementById('wind-gust').textContent = `${convertToMarathiNumerals(Math.round((data.wind.gust || data.wind.speed) * 3.6))} किमी/ता`;
        document.getElementById('visibility').textContent = `${convertToMarathiNumerals((data.visibility / 1000).toFixed(1))} किमी`;
    }

    // Helper function to calculate dew point
    function calculateDewPoint(temp, humidity) {
        // Simple approximation formula for Celsius
        return temp - (100 - humidity) / 5;
    }

    // UI state functions
    function showLoading() {
        loading.style.display = 'block';
        currentWeather.style.opacity = '0.5';
        forecastContainer.style.opacity = '0.5';
    }

    function hideLoading() {
        loading.style.display = 'none';
        currentWeather.style.opacity = '1';
        forecastContainer.style.opacity = '1';
    }

    function showError() {
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }
}