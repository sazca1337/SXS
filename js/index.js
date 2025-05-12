document.addEventListener('DOMContentLoaded', function() {
    // Carousel animation
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselItems = document.querySelectorAll('.carousel-item');
    
    carouselItems.forEach(item => {
        const clone = item.cloneNode(true);
        carouselContainer.appendChild(clone);
    });
    
    function resetAnimation() {
        carouselContainer.style.animation = 'none';
        void carouselContainer.offsetWidth;
        carouselContainer.style.animation = 'carousel 30s linear infinite';
    }
    
    carouselContainer.addEventListener('animationend', resetAnimation);
    
    carouselContainer.addEventListener('animationiteration', function() {
        if (getComputedStyle(carouselContainer).animationPlayState === 'paused') {
            resetAnimation();
        }
    });
    
    resetAnimation();
    
    // Banner slideshow
    const bannerFrames = document.querySelectorAll('.banner-frame');
    let currentFrame = 0;
    
    // Show the first frame initially
    if (bannerFrames.length > 0) {
        bannerFrames[0].classList.add('active');
    }
    
    // Function to change the active frame
    function changeFrame() {
        // Remove active class from current frame
        bannerFrames[currentFrame].classList.remove('active');
        
        // Move to next frame
        currentFrame = (currentFrame + 1) % bannerFrames.length;
        
        // Add active class to new frame
        bannerFrames[currentFrame].classList.add('active');
    }
    
    // Change frame every 10 seconds
    setInterval(changeFrame, 10000);
});
