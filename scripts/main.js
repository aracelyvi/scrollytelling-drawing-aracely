gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    
    // 1. THEME PERSISTENCE
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
    }
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // 2. CANVAS STATE
    let isDrawing = false, canDraw = false, isLocked = false; 
    let currentSize = 5, currentOpacity = 0.9;
    let lastX = 0, lastY = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const getDynamicColor = (opacity) => {
        const hex = getComputedStyle(document.body).getPropertyValue('--color-charcoal').trim();
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // 3. STICK SELECTION
    document.querySelectorAll('.charcoal-stick').forEach(stick => {
        stick.addEventListener('click', () => {
            if (isLocked) return;
            canDraw = true; 
            currentSize = parseInt(stick.getAttribute('data-size'));
            currentOpacity = parseFloat(stick.getAttribute('data-opacity'));
            const tl = gsap.timeline();
            tl.to(".charcoal-stick", { y: 0, duration: 0.2 })
              .to(stick, { y: -25, ease: "back.out(2)" })
              .to("#step-select", { opacity: 0, y: -10, duration: 0.3, display: "none" })
              .to("#step-scribble", { opacity: 1, y: 0, display: "block", duration: 0.4 });
            document.querySelectorAll('.charcoal-stick').forEach(s => s.classList.remove('active'));
            stick.classList.add('active');
        });
    });

    // 4. DRAWING ENGINE
    canvas.addEventListener('mousemove', (e) => {
        const speed = Math.abs(e.clientX - lastX);
        if (ScrollTrigger.isInViewport("#chapter-6") && speed > 50) {
            ctx.filter = "blur(4px)";
            setTimeout(() => ctx.filter = "none", 100);
        }
        if (!isDrawing || isLocked) { lastX = e.clientX; lastY = e.clientY; return; }
        if (ScrollTrigger.isInViewport("#chapter-3") && speed > 35) {
            ctx.beginPath(); 
        } else {
            ctx.lineWidth = (ctx.globalCompositeOperation === 'destination-out') ? 60 : currentSize;
            ctx.lineCap = 'round'; ctx.strokeStyle = getDynamicColor(currentOpacity);
            ctx.lineTo(e.clientX, e.clientY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(e.clientX, e.clientY);
        }
        lastX = e.clientX; lastY = e.clientY;
    });

    canvas.onmousedown = () => { if(canDraw && !isLocked) isDrawing = true; };
    canvas.onmouseup = () => { isDrawing = false; ctx.beginPath(); };

    // 5. PEELING TAPE
    const tapeTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#chapter-4",
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 1
        }
    });
    tapeTL.to(".tape-strip.top", { y: -600, rotation: 15 })
          .to(".tape-strip.bottom", { y: 600, rotation: -15 }, "<")
          .to(".tape-strip.left", { x: -600, rotation: -10 }, "-=0.2")
          .to(".tape-strip.right", { x: 600, rotation: 10 }, "<");

    // 6. MIST LAYER (Chapter 7 only)
    gsap.to(".mist-layer", {
        opacity: 1,
        scrollTrigger: { 
            trigger: "#chapter-7", 
            start: "top center", 
            end: "bottom top", 
            scrub: true,
            onUpdate: self => isLocked = self.progress > 0.5,
            onLeave: () => gsap.to(".mist-layer", { opacity: 0, duration: 0.3 }),
            onLeaveBack: () => gsap.to(".mist-layer", { opacity: 0, duration: 0.3 }),
            onEnter: () => gsap.set(".mist-layer", { opacity: 0 }),
            onEnterBack: () => gsap.set(".mist-layer", { opacity: 0 })
        }
    });

    // 7. SECTION REVEALS
    ["#chapter-1", "#chapter-3", "#chapter-5", "#chapter-6", "#chapter-8"].forEach(id => {
        gsap.from(`${id} .content-wrapper`, {
            y: 40, opacity: 0, duration: 1, 
            scrollTrigger: { trigger: id, start: "top 80%", toggleActions: "play none none reverse" }
        });
    });

    ScrollTrigger.create({ 
        trigger: "#chapter-5", 
        start: "top center", 
        onToggle: self => ctx.globalCompositeOperation = self.isActive ? 'destination-out' : 'source-over' 
    });

    document.getElementById('signature-svg').onclick = () => document.getElementById('sig-path').classList.add('signed');

    // 8. RESET TRIGGER
    ScrollTrigger.create({
        trigger: "#chapter-1",
        start: "top center",
        onEnterBack: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            canDraw = false;
            isLocked = false;
            document.querySelectorAll('.charcoal-stick').forEach(stick => {
                stick.classList.remove('active');
                gsap.to(stick, { y: 0, duration: 0.3 });
            });
            document.getElementById('step-scribble').style.display = "none";
            document.getElementById('step-scribble').style.opacity = "0";
            document.getElementById('step-select').style.display = "block";
            document.getElementById('step-select').style.opacity = "1";
            document.getElementById('sig-path').classList.remove('signed');
            gsap.to(".mist-layer", { opacity: 0, duration: 0.1 });
        }
    });
});