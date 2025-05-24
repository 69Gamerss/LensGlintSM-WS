document.addEventListener('DOMContentLoaded', function() {
    const ticket = document.querySelector('.ticket');
    const holographicOverlay = document.querySelector('.holographic-overlay');
    
    ticket.addEventListener('mousemove', function(e) {
        const rect = ticket.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate percentage position
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // Create much bigger ellipse with more coverage - increased from 40% x 30% to 60% x 45%
        const radiusX = Math.min(rect.width, rect.height) * 0.6; // 60% for width (much bigger)
        const radiusY = Math.min(rect.width, rect.height) * 0.45; // 45% for height (much bigger)
        
        // Update mask to reveal holographic effect where mouse is - much bigger ellipse with more fade
        holographicOverlay.style.mask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${xPercent}% ${yPercent}%, white 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)`;
        holographicOverlay.style.webkitMask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${xPercent}% ${yPercent}%, white 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)`;
        
        // Calculate mouse position relative to center for 3D tilt effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -10; // Tilt up/down (inverted)
        const rotateY = (x - centerX) / centerX * 10; // Tilt left/right
        
        // Apply 3D transform that makes ticket "pop up" towards mouse
        ticket.style.transform = `translateY(-0.5vw) translateZ(2vw) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    ticket.addEventListener('mouseleave', function() {
        // Hide holographic effect and reset transform when mouse leaves
        holographicOverlay.style.mask = 'radial-gradient(circle 0px at 50% 50%, white 100%, transparent 100%)';
        holographicOverlay.style.webkitMask = 'radial-gradient(circle 0px at 50% 50%, white 100%, transparent 100%)';
        
        // Reset transform
        ticket.style.transform = 'translateY(0) translateZ(0) rotateX(0deg) rotateY(0deg) scale(1)';
    });
});
