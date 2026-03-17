window.addEventListener('load', () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
        
        // --- A. HERO & TAPE STICKING ---
        const heroTl = gsap.timeline();
        heroTl.to(".tape-strip", {
            opacity: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.inOut"
        })
        .to("h1, #chapter-1 .icon-box, #chapter-1 p", { opacity: 1, y: -10, stagger: 0.2 });

        // --- B. PICKUP & DRAWING LOGIC ---
        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let canDraw = false;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.getElementById('pencil-trigger').addEventListener('click', () => {
            canDraw = true;
            gsap.to("#pencil", { scale: 1.3, rotation: 0, duration: 0.5, ease: "back.out" });
            console.log("Pencil active");
        });

        canvas.addEventListener('mousedown', () => { if(canDraw) isDrawing = true; });
        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(26, 26, 26, 0.15)';
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.clientX, e.clientY);
        });
        window.addEventListener('mouseup', () => { isDrawing = false; ctx.beginPath(); });

        // --- C. CLICK TO PEEL TAPE ---
        document.querySelectorAll('.tape-strip').forEach(strip => {
            strip.addEventListener('click', (e) => {
                gsap.to(e.target, {
                    y: -1000,
                    rotation: Math.random() * 20 - 10,
                    duration: 1.2,
                    ease: "power2.in"
                });
            });
        });

        // --- D. SECONDARY SECTION ANIMATIONS ---
        gsap.to("#chapter-2 .icon-box, #chapter-2 h2, #chapter-2 p", {
            opacity: 1, stagger: 0.2, delay: 1
        });

        // Hand Animation
        gsap.to("#hand", { y: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });

        // Mist Animation
        gsap.to(".mist", { x: 15, opacity: 0, stagger: 0.1, repeat: -1, ease: "none" });
        
        // Loop Animation
        gsap.to("#loop", { rotation: 360, duration: 10, repeat: -1, ease: "linear" });

        // Chapter 5 Reveal
        gsap.to("#chapter-5 .icon-box, #chapter-5 h2, #chapter-5 p, .mist-layer", {
            opacity: 1, delay: 2
        });
    }
});