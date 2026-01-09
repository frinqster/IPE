// --- LANDING PAGE BACKGROUND & CURSOR ---
(function () {
    // Configuration
    const BG_PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 150;
    const BG_MOUSE_RADIUS = 200;
    const BG_PARTICLE_COLOR = 'rgba(0, 255, 204, 0.7)'; // #00ffcc
    const BG_LINE_COLOR = 'rgba(0, 255, 204,';

    // Enhancement Config
    const FLOATING_SHAPE_COUNT = 6;
    const DATA_STREAM_CHANCE = 0.02; // Chance per frame to spawn a data stream

    // Variables
    let bgCanvas;
    let bgCtx;
    let bgParticlesArray;
    let floatingShapesArray;
    let dataStreamsArray = [];
    let landingPage;
    let cursorDot;
    let cursorOutline;

    // Mouse State
    const mouse = {
        x: null,
        y: null,
        radius: BG_MOUSE_RADIUS
    };

    function initLandingAnimation() {
        console.log("Initializing Landing Background & Cursor...");

        landingPage = document.getElementById('landing-page');
        cursorDot = document.getElementById('cursor-dot');
        cursorOutline = document.getElementById('cursor-outline');

        if (!landingPage) return;

        // Create Canvas
        if (!document.getElementById('bg-canvas')) {
            bgCanvas = document.createElement('canvas');
            bgCanvas.id = 'bg-canvas';
            bgCanvas.style.position = 'absolute';
            bgCanvas.style.top = '0';
            bgCanvas.style.left = '0';
            bgCanvas.style.width = '100%';
            bgCanvas.style.height = '100%';
            bgCanvas.style.zIndex = '0';
            bgCanvas.style.pointerEvents = 'none';
            landingPage.insertBefore(bgCanvas, landingPage.firstChild);
            bgCtx = bgCanvas.getContext('2d');
        } else {
            bgCanvas = document.getElementById('bg-canvas');
            bgCtx = bgCanvas.getContext('2d');
        }

        if (bgCtx) {
            resizeBgCanvas();
            window.addEventListener('resize', resizeBgCanvas);
            initBgParticles();
            initFloatingShapes();
            animateBgParticles();
        }

        // Initialize Cursor interactions
        initCursorEvents();
    }

    function resizeBgCanvas() {
        if (!bgCanvas) return;
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        initBgParticles();
        initFloatingShapes();
    }

    // --- CURSOR LOGIC ---
    function initCursorEvents() {
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;

            if (cursorDot && cursorOutline) {
                cursorDot.style.left = `${mouse.x}px`;
                cursorDot.style.top = `${mouse.y}px`;

                cursorOutline.animate({
                    left: `${mouse.x}px`,
                    top: `${mouse.y}px`
                }, { duration: 500, fill: "forwards" });
            }
        });

        window.addEventListener('mousedown', () => {
            if (cursorOutline) {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.8)';
                cursorOutline.style.borderColor = '#fff';
            }
        });

        window.addEventListener('mouseup', () => {
            if (cursorOutline) {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.borderColor = '#00ffcc';
                createRipple(mouse.x, mouse.y);
            }
        });

        // --- HIDE CURSOR ON KEYBOARD/TOUCH ---
        function hideCursor() {
            if (cursorDot) cursorDot.style.opacity = '0';
            if (cursorOutline) cursorOutline.style.opacity = '0';
        }

        function showCursor() {
            if (cursorDot) cursorDot.style.opacity = '1';
            if (cursorOutline) cursorOutline.style.opacity = '1';
        }

        window.addEventListener('keydown', hideCursor);
        window.addEventListener('touchstart', hideCursor, { passive: true });
        window.addEventListener('mousemove', showCursor);

        const selectorList = [
            'button',
            'a',
            '.perf-option',
            '.flip-btn',
            '.l-nav-item',
            'input',
            '.perf-help-btn',       // Help button in perf selector
            '.settings-help-btn',   // Help button in neural calibration
            '#panel-toggle',        // Controls panel arrow
            '#help-btn-trigger',    // Help button in controls
            '#screenshot-trigger',  // Camera button
            '#settings-trigger',    // Settings button
            '.swatch',              // Color presets
            '.custom-color-wrapper',// Particle spectrum button (wrapper)
            '#color-preview',       // Particle spectrum button (box)
            '#cp-mode-label',       // Oct/Hex mode toggle
            '.tech-dropdown-selected', // Custom dropdown trigger
            '.tech-option',         // Custom dropdown options
            '.perf-option',         // Launch performance selector options
            '.toggle-btn',          // Toggle buttons (if class exists)
            '.color-preset',        // Color presets (if class exists)
            '.nc-header',           // Accordion headers
            '.close-modal',         // Close buttons
            '.gesture-item',        // Gesture cards
            '#vib-toggle-btn',      // Vibration toggle
            '#blur-toggle-btn',     // Blur toggle
            '#cam-swap-btn'         // Layout swap button
        ];
        const clickables = document.querySelectorAll(selectorList.join(', '));
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursorOutline) {
                    cursorOutline.classList.add('cursor-hover');
                }
            });
            el.addEventListener('mouseleave', () => {
                if (cursorOutline) {
                    cursorOutline.classList.remove('cursor-hover');
                }
            });
        });
    }

    function createRipple(x, y) {
        if (!document.body) return;
        const ripple = document.createElement('div');
        ripple.className = 'cursor-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        document.body.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    // --- PARTICLE LOGIC ---
    class BgParticle {
        constructor() {
            const w = (bgCanvas) ? bgCanvas.width : window.innerWidth;
            const h = (bgCanvas) ? bgCanvas.height : window.innerHeight;

            this.size = Math.random() * 2 + 1;
            this.x = Math.random() * ((w - this.size * 2) - (this.size * 2)) + this.size * 2;
            this.y = Math.random() * ((h - this.size * 2) - (this.size * 2)) + this.size * 2;
            this.directionX = (Math.random() * 2) - 1;
            this.directionY = (Math.random() * 2) - 1;
            this.color = BG_PARTICLE_COLOR;
        }

        draw() {
            if (!bgCtx) return;
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            bgCtx.fillStyle = this.color;
            bgCtx.fill();
        }

        update() {
            const w = (bgCanvas) ? bgCanvas.width : window.innerWidth;
            const h = (bgCanvas) ? bgCanvas.height : window.innerHeight;

            if (this.x > w || this.x < 0) this.directionX = -this.directionX;
            if (this.y > h || this.y < 0) this.directionY = -this.directionY;

            // Interaction
            if (mouse.x != undefined && mouse.y != undefined) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < w - this.size * 10) this.x += 2;
                    if (mouse.x > this.x && this.x > this.size * 10) this.x -= 2;
                    if (mouse.y < this.y && this.y < h - this.size * 10) this.y += 2;
                    if (mouse.y > this.y && this.y > this.size * 10) this.y -= 2;
                }
            }

            this.x += this.directionX * 0.4;
            this.y += this.directionY * 0.4;
            this.draw();
        }
    }

    // --- FLOATING SHAPES LOGIC ---
    class FloatingShape {
        constructor() {
            const w = (bgCanvas) ? bgCanvas.width : window.innerWidth;
            const h = (bgCanvas) ? bgCanvas.height : window.innerHeight;

            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 40 + 20; // Size 20-60
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.sides = Math.floor(Math.random() * 3) + 3; // 3 to 5 sides (Triangle, Square, Pentagon)
            this.color = `rgba(0, 255, 204, ${Math.random() * 0.1 + 0.05})`; // Very faint
        }

        draw() {
            bgCtx.save();
            bgCtx.translate(this.x, this.y);
            bgCtx.rotate(this.rotation);
            bgCtx.strokeStyle = this.color;
            bgCtx.lineWidth = 1;
            bgCtx.beginPath();

            for (let i = 0; i < this.sides; i++) {
                const angle = (i * 2 * Math.PI) / this.sides;
                const sx = this.size * Math.cos(angle);
                const sy = this.size * Math.sin(angle);
                if (i === 0) bgCtx.moveTo(sx, sy);
                else bgCtx.lineTo(sx, sy);
            }
            bgCtx.closePath();
            bgCtx.stroke();
            bgCtx.restore();
        }

        update() {
            const w = (bgCanvas) ? bgCanvas.width : window.innerWidth;
            const h = (bgCanvas) ? bgCanvas.height : window.innerHeight;

            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            if (this.x < -this.size) this.x = w + this.size;
            if (this.x > w + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = h + this.size;
            if (this.y > h + this.size) this.y = -this.size;

            this.draw();
        }
    }

    // --- DATA STREAM LOGIC ---
    class DataStream {
        constructor() {
            const w = (bgCanvas) ? bgCanvas.width : window.innerWidth;
            const h = (bgCanvas) ? bgCanvas.height : window.innerHeight;

            this.horizontal = Math.random() > 0.5;
            if (this.horizontal) {
                this.x = (Math.random() > 0.5) ? -100 : w + 100;
                this.y = Math.random() * h;
                this.speedX = (this.x < 0) ? (Math.random() * 5 + 5) : -(Math.random() * 5 + 5);
                this.speedY = 0;
            } else {
                this.x = Math.random() * w;
                this.y = (Math.random() > 0.5) ? -100 : h + 100;
                this.speedX = 0;
                this.speedY = (this.y < 0) ? (Math.random() * 5 + 5) : -(Math.random() * 5 + 5);
            }

            this.size = Math.random() * 2 + 1;
            this.length = Math.random() * 50 + 20;
            this.life = 1.0;
            this.decay = Math.random() * 0.01 + 0.005;
        }

        draw() {
            bgCtx.globalAlpha = this.life;
            bgCtx.fillStyle = '#00ffcc';

            // Draw trail
            if (this.horizontal) {
                const tailX = this.x - (this.speedX * 5); // Approximate trail
                const grad = bgCtx.createLinearGradient(this.x, this.y, tailX, this.y);
                grad.addColorStop(0, '#00ffcc');
                grad.addColorStop(1, 'rgba(0, 255, 204, 0)');
                bgCtx.fillStyle = grad;
                bgCtx.fillRect(Math.min(this.x, tailX), this.y, Math.abs(this.x - tailX), this.size);
            } else {
                const tailY = this.y - (this.speedY * 5); // Approximate trail
                const grad = bgCtx.createLinearGradient(this.x, this.y, this.x, tailY);
                grad.addColorStop(0, '#00ffcc');
                grad.addColorStop(1, 'rgba(0, 255, 204, 0)');
                bgCtx.fillStyle = grad;
                bgCtx.fillRect(this.x, Math.min(this.y, tailY), this.size, Math.abs(this.y - tailY));
            }

            bgCtx.globalAlpha = 1.0;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            this.draw();
        }
    }

    function initBgParticles() {
        if (!bgCanvas) return;
        bgParticlesArray = [];
        let numberOfParticles = (bgCanvas.height * bgCanvas.width) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
            bgParticlesArray.push(new BgParticle());
        }
    }

    function initFloatingShapes() {
        if (!bgCanvas) return;
        floatingShapesArray = [];
        for (let i = 0; i < FLOATING_SHAPE_COUNT; i++) {
            floatingShapesArray.push(new FloatingShape());
        }
    }

    function animateBgParticles() {
        requestAnimationFrame(animateBgParticles);
        if (!bgCtx || !bgCanvas) return;
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

        // Update Shapes
        for (let i = 0; i < floatingShapesArray.length; i++) {
            floatingShapesArray[i].update();
        }

        // Update Particles
        for (let i = 0; i < bgParticlesArray.length; i++) {
            bgParticlesArray[i].update();
        }
        connectBgParticles();

        // Spawn & Update Data Streams
        if (Math.random() < DATA_STREAM_CHANCE) {
            dataStreamsArray.push(new DataStream());
        }
        for (let i = dataStreamsArray.length - 1; i >= 0; i--) {
            dataStreamsArray[i].update();
            if (dataStreamsArray[i].life <= 0 ||
                dataStreamsArray[i].x < -200 || dataStreamsArray[i].x > bgCanvas.width + 200 ||
                dataStreamsArray[i].y < -200 || dataStreamsArray[i].y > bgCanvas.height + 200) {
                dataStreamsArray.splice(i, 1);
            }
        }
    }

    function connectBgParticles() {
        let opacityValue = 1;
        for (let a = 0; a < bgParticlesArray.length; a++) {
            for (let b = a; b < bgParticlesArray.length; b++) {
                let distance = ((bgParticlesArray[a].x - bgParticlesArray[b].x) * (bgParticlesArray[a].x - bgParticlesArray[b].x)) +
                    ((bgParticlesArray[a].y - bgParticlesArray[b].y) * (bgParticlesArray[a].y - bgParticlesArray[b].y));

                if (distance < (bgCanvas.width / 7) * (bgCanvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    if (opacityValue > 0) {
                        bgCtx.strokeStyle = BG_LINE_COLOR + opacityValue + ')';
                        bgCtx.lineWidth = 1;
                        bgCtx.beginPath();
                        bgCtx.moveTo(bgParticlesArray[a].x, bgParticlesArray[a].y);
                        bgCtx.lineTo(bgParticlesArray[b].x, bgParticlesArray[b].y);
                        bgCtx.stroke();
                    }
                }
            }
        }
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLandingAnimation);
    } else {
        initLandingAnimation();
    }
})();
