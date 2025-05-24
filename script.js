document.addEventListener('DOMContentLoaded', function() {
    const ticket = document.querySelector('.ticket');
    const holographicOverlay = document.querySelector('.holographic-overlay');
    
    // Variables for device motion
    let isUsingDeviceMotion = false;
    let deviceMotionSupported = false;
    
    // Check if device motion is supported
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
        deviceMotionSupported = true;
    } else if (window.DeviceOrientationEvent) {
        deviceMotionSupported = true;
    }
    
    // Function to handle mouse movement (desktop)
    function handleMouseMove(e) {
        if (isUsingDeviceMotion) return; // Don't interfere with device motion
        
        const rect = ticket.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate percentage position
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // Create much bigger ellipse with more coverage
        const radiusX = Math.min(rect.width, rect.height) * 0.6;
        const radiusY = Math.min(rect.width, rect.height) * 0.45;
        
        // Update mask to reveal holographic effect where mouse is
        holographicOverlay.style.mask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${xPercent}% ${yPercent}%, white 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)`;
        holographicOverlay.style.webkitMask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${xPercent}% ${yPercent}%, white 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)`;
        
        // Calculate mouse position relative to center for 3D tilt effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        // Apply 3D transform
        ticket.style.transform = `translateY(-0.5vw) translateZ(2vw) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    }
    
    // Function to handle mouse leave (desktop)
    function handleMouseLeave() {
        if (isUsingDeviceMotion) return;
        
        // Hide holographic effect and reset transform
        holographicOverlay.style.mask = 'radial-gradient(circle 0px at 50% 50%, white 100%, transparent 100%)';
        holographicOverlay.style.webkitMask = 'radial-gradient(circle 0px at 50% 50%, white 100%, transparent 100%)';
        ticket.style.transform = 'translateY(0) translateZ(0) rotateX(0deg) rotateY(0deg) scale(1)';
    }
    
    // Function to handle device orientation (mobile)
    function handleDeviceOrientation(event) {
        if (!isUsingDeviceMotion) return;
        
        // Get orientation values
        const beta = event.beta || 0;   // X-axis rotation (-180 to 180)
        const gamma = event.gamma || 0; // Y-axis rotation (-90 to 90)
        
        // Normalize and limit the rotation values
        const rotateX = Math.max(-15, Math.min(15, beta * 0.3));
        const rotateY = Math.max(-15, Math.min(15, gamma * 0.5));
        
        // Calculate holographic effect position based on tilt
        const xPercent = 50 + (gamma * 2); // Center + tilt influence
        const yPercent = 50 + (beta * 1.5);
        
        // Ensure percentages stay within bounds
        const clampedX = Math.max(0, Math.min(100, xPercent));
        const clampedY = Math.max(0, Math.min(100, yPercent));
        
        // Create holographic effect
        const rect = ticket.getBoundingClientRect();
        const radiusX = Math.min(rect.width, rect.height) * 0.7;
        const radiusY = Math.min(rect.width, rect.height) * 0.5;
        
        holographicOverlay.style.mask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${clampedX}% ${clampedY}%, white 0%, rgba(255,255,255,0.8) 10%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.2) 45%, transparent 70%)`;
        holographicOverlay.style.webkitMask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${clampedX}% ${clampedY}%, white 0%, rgba(255,255,255,0.8) 10%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.2) 45%, transparent 70%)`;
        
        // Apply 3D transform based on device orientation
        ticket.style.transform = `translateY(-0.3vw) translateZ(1.5vw) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        
        // Show holographic overlay
        holographicOverlay.style.opacity = '1';
    }
    
    // Function to request device motion permission (iOS 13+)
    async function requestDeviceMotionPermission() {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceMotionEvent.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.log('Device motion permission request failed:', error);
                return false;
            }
        }
        return true; // Permission not required on this device
    }
    
    // Function to enable device motion
    async function enableDeviceMotion() {
        if (!deviceMotionSupported) return false;
        
        const permissionGranted = await requestDeviceMotionPermission();
        if (!permissionGranted) return false;
        
        isUsingDeviceMotion = true;
        
        // Add device orientation listener
        window.addEventListener('deviceorientation', handleDeviceOrientation, true);
        
        // Remove mouse event listeners to avoid conflicts
        ticket.removeEventListener('mousemove', handleMouseMove);
        ticket.removeEventListener('mouseleave', handleMouseLeave);
        
        return true;
    }
    
    // Detect if device is mobile/tablet
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }
    
    // Initialize appropriate interaction method
    if (isMobileDevice() && deviceMotionSupported) {
        // Try to enable device motion on mobile
        ticket.addEventListener('touchstart', async function() {
            if (!isUsingDeviceMotion) {
                const success = await enableDeviceMotion();
                if (success) {
                    console.log('Device motion enabled for gyroscope tilt effects');
                } else {
                    // Fallback to touch-based interaction
                    console.log('Device motion not available, using touch fallback');
                    initializeTouchFallback();
                }
            }
        }, { once: true });
        
        // Also add mouse events as fallback
        ticket.addEventListener('mousemove', handleMouseMove);
        ticket.addEventListener('mouseleave', handleMouseLeave);
    } else {
        // Desktop: use mouse events
        ticket.addEventListener('mousemove', handleMouseMove);
        ticket.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Touch fallback for devices without device motion
    function initializeTouchFallback() {
        ticket.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = ticket.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Calculate percentage position
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            
            // Create holographic effect
            const radiusX = Math.min(rect.width, rect.height) * 0.6;
            const radiusY = Math.min(rect.width, rect.height) * 0.45;
            
            holographicOverlay.style.mask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${xPercent}% ${yPercent}%, white 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)`;
            holographicOverlay.style.webkitMask = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${xPercent}% ${yPercent}%, white 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)`;
            
            // Calculate touch position relative to center for 3D tilt effect
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;
            
            ticket.style.transform = `translateY(-0.3vw) translateZ(1.5vw) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
            holographicOverlay.style.opacity = '1';
        });
        
        ticket.addEventListener('touchend', function() {
            holographicOverlay.style.mask = 'radial-gradient(circle 0px at 50% 50%, white 100%, transparent 100%)';
            holographicOverlay.style.webkitMask = 'radial-gradient(circle 0px at 50% 50%, white 100%, transparent 100%)';
            ticket.style.transform = 'translateY(0) translateZ(0) rotateX(0deg) rotateY(0deg) scale(1)';
            holographicOverlay.style.opacity = '0';
        });
    }
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        if (isUsingDeviceMotion) {
            window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
        }
    });
});
