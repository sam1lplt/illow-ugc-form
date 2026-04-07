document.addEventListener('DOMContentLoaded', () => {
    // Preloader Logic
    const preloader = document.getElementById('preloader');
    
    // Simulate loading time for cloud animation to be clearly visible
    setTimeout(() => {
        preloader.classList.add('fade-out');
        document.body.classList.remove('loading');
        
        // Remove from DOM entirely after transition
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 800);
    }, 2000);

    const form = document.getElementById('creator-form');
    const formPanel = document.getElementById('form-panel');
    const successPanel = document.getElementById('success-panel');
    const submitBtn = document.getElementById('submit-btn');
    const moon = document.getElementById('moon');
    const clouds = document.querySelectorAll('.cloud');
    
    // Parallax effect on mouse move
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Moon reacts slightly and glows based on horizontal position
        const moonX = (x - 0.5) * 20;
        const moonY = (y - 0.5) * 20;
        moon.style.transform = `translate(${moonX}px, ${moonY}px) rotate(-15deg)`;
        
        // If mouse is upper right corner, moon glows
        if(x > 0.7 && y < 0.3) {
            moon.classList.add('glow-active');
        } else {
            moon.classList.remove('glow-active');
        }

        // Slight parallax for clouds
        clouds.forEach((cloud, index) => {
            const speed = (index + 1) * 5;
            const xOffset = (x - 0.5) * speed;
            const yOffset = (y - 0.5) * speed;
            
            // Because they have their own animations, we want to smoothly add this
            cloud.style.marginLeft = `${xOffset}px`;
            cloud.style.marginTop = `${yOffset}px`;
        });
    });

    // Form submission processing
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Button loading state
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.innerText;
        btnText.innerText = "Gönderiliyor... ✨";
        submitBtn.style.pointerEvents = 'none';

        // Gather data (Dummy preparation)
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log("Gönderilen veriler:", data);

        // Simulate API Request with dummy fetch / delay
        try {
            // Using a simple Promise to fake a network request of 1.5 seconds
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // On success
            showSuccess();
            
        } catch (error) {
            console.error("Submission failed", error);
            btnText.innerText = "Bir Hata Oluştu!";
            setTimeout(() => {
                btnText.innerText = originalText;
                submitBtn.style.pointerEvents = 'auto';
            }, 2000);
        }
    });

    function showSuccess() {
        // Fade out form panel
        formPanel.classList.add('fade-out');
        
        setTimeout(() => {
            formPanel.style.display = 'none';
            successPanel.style.display = 'block';
            setTimeout(() => {
                successPanel.classList.remove('hidden');
            }, 50);
        }, 600);
    }

    // KVKK Modal Logic
    const openKvkkBtn = document.getElementById('open-kvkk');
    const closeKvkkBtn = document.getElementById('close-kvkk');
    const kvkkModal = document.getElementById('kvkk-modal');

    if (openKvkkBtn && closeKvkkBtn && kvkkModal) {
        openKvkkBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent checkbox from toggling
            e.stopPropagation(); // Stop bubbling to label
            kvkkModal.classList.remove('hidden');
        });

        closeKvkkBtn.addEventListener('click', () => {
            kvkkModal.classList.add('hidden');
        });

        // Close on outside click
        kvkkModal.addEventListener('click', (e) => {
            if (e.target === kvkkModal) {
                kvkkModal.classList.add('hidden');
            }
        });
    }

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});
