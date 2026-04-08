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

    // Form submission — Firestore'a kaydet
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.innerText;
        btnText.innerText = "Gönderiliyor... ✨";
        submitBtn.style.pointerEvents = 'none';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Platforms (checkboxlar multiple olduğu için ayrıca topla)
        data.platforms = formData.getAll('platforms');
        
        // Telefon numarasını document ID olarak kullan (+90 formatında)
        let phone = (data.phone || '').toString().replace(/\s/g, '');
        if (!phone.startsWith('+')) phone = '+90' + phone.replace(/^0/, '');
        data.phone = phone;
        data.status = 'incelemede';
        data.created_at = new Date().toISOString();

        try {
            const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js");
            const { getFirestore, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js");

            const firebaseConfig = {
                apiKey: "AIzaSyDWvIuBR-4f9eBQb0OvdwKnUfSJFyCaoz4",
                authDomain: "pillow-ugc-database.firebaseapp.com",
                projectId: "pillow-ugc-database",
                storageBucket: "pillow-ugc-database.firebasestorage.app",
                messagingSenderId: "122351696078",
                appId: "1:122351696078:web:7b8b7d5bfa0f3f646b389f"
            };

            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const db = getFirestore(app);

            // Document ID = telefon numarası (portal ile eşleşsin diye)
            await setDoc(doc(db, 'applications', phone), data);
            
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
