// Loading animation
function startLoading() {
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');
    
    const texts = [
        "संसाधने लोड होत आहेत...",
        "सेवा तयार करत आहे...",
        "समुदायाशी जोडले जात आहे...",
        "जवळजवळ तयार आहे..."
    ];
    
    let progress = 0;
    let textIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                // Redirect to home page
                window.location.href = 'home.html';
            }, 500);
        }
        
        progressBar.style.width = `${progress}%`;
        
        if (progress > 20 && textIndex === 0) {
            loadingText.innerHTML = texts[0] + '<span class="loading-dots">...</span>';
            textIndex = 1;
        } else if (progress > 45 && textIndex === 1) {
            loadingText.innerHTML = texts[1] + '<span class="loading-dots">...</span>';
            textIndex = 2;
        } else if (progress > 70 && textIndex === 2) {
            loadingText.innerHTML = texts[2] + '<span class="loading-dots">...</span>';
            textIndex = 3;
        } else if (progress > 90 && textIndex === 3) {
            loadingText.innerHTML = texts[3] + '<span class="loading-dots">...</span>';
            textIndex = 4;
        }
    }, 300);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    startLoading();
});