class WaterRipple {
    constructor(container) {
        this.container = container;
        this.container.innerHTML = '';
        
        // Canvas 1 (bgCanvas) - z-index 0
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.style.position = 'absolute';
        this.bgCanvas.style.zIndex = '0';
        this.bgCanvas.style.left = '0';
        this.bgCanvas.style.top = '0';
        this.bgCanvas.style.width = '100%';
        this.bgCanvas.style.height = '100%';
        this.container.appendChild(this.bgCanvas);
        this.bgCtx = this.bgCanvas.getContext('2d', { alpha: false });
        
        // Canvas 1.5 (causticCanvas) - z-index 1
        this.causticCanvas = document.createElement('canvas');
        this.causticCanvas.style.position = 'absolute';
        this.causticCanvas.style.zIndex = '1';
        this.causticCanvas.style.left = '0';
        this.causticCanvas.style.top = '0';
        this.causticCanvas.style.width = '100%';
        this.causticCanvas.style.height = '100%';
        this.causticCanvas.style.mixBlendMode = 'screen';
        this.causticCanvas.style.opacity = '0.55';
        this.container.appendChild(this.causticCanvas);
        this.cCtx = this.causticCanvas.getContext('2d', { willReadFrequently: true });
        
        // Canvas 2 (rippleCanvas) - z-index 2
        this.rippleCanvas = document.createElement('canvas');
        this.rippleCanvas.style.position = 'absolute';
        this.rippleCanvas.style.zIndex = '2';
        this.rippleCanvas.style.left = '0';
        this.rippleCanvas.style.top = '0';
        this.rippleCanvas.style.width = '100%';
        this.rippleCanvas.style.height = '100%';
        this.rippleCanvas.style.mixBlendMode = 'overlay';
        this.rippleCanvas.style.opacity = '0.5';
        this.container.appendChild(this.rippleCanvas);
        this.ctx = this.rippleCanvas.getContext('2d', { willReadFrequently: true });
        
        // Canvas 3 (bubbleCanvas) - z-index 3 — rising bubbles layer
        this.bubbleCanvas = document.createElement('canvas');
        this.bubbleCanvas.style.position = 'absolute';
        this.bubbleCanvas.style.zIndex = '3';
        this.bubbleCanvas.style.left = '0';
        this.bubbleCanvas.style.top = '0';
        this.bubbleCanvas.style.width = '100%';
        this.bubbleCanvas.style.height = '100%';
        this.bubbleCanvas.style.pointerEvents = 'none';
        this.container.appendChild(this.bubbleCanvas);
        this.bCtx = this.bubbleCanvas.getContext('2d');
        
        // Bubble pool
        this.bubbles = [];
        this.MAX_BUBBLES = 60;
        this.lastAutoSpawn = 0;

        this.DAMPING = 0.994;
        this.SCALE = 2;
        this.CSCALE = 4;
        this.MOUSE_RADIUS = 13;
        this.MOUSE_STRENGTH = 85;
        this.CLICK_RADIUS = 80;
        this.CLICK_STRENGTH = 300;
        
        this.cols = 0;
        this.rows = 0;
        this.cCols = 0;
        this.cRows = 0;
        this.mouseX = -999;
        this.mouseY = -999;
        
        this.startTime = performance.now();
        
        this.bindEvents();
        this.resize();
        this.loop();
    }
    
    drawBackground() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.bgCanvas.width = w;
        this.bgCanvas.height = h;
        
        // Deep midnight ocean gradient — matches the portfolio navy/teal theme
        const grad = this.bgCtx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0,    '#0e2a4a');   // deep midnight navy (surface)
        grad.addColorStop(0.20, '#0a3d5c');   // dark ocean teal
        grad.addColorStop(0.45, '#073d58');   // deep sapphire teal
        grad.addColorStop(0.70, '#052e47');   // abyssal deep blue
        grad.addColorStop(1,    '#061e38');   // near-black ocean floor
        this.bgCtx.fillStyle = grad;
        this.bgCtx.fillRect(0, 0, w, h);
        
        // Subtle surface shimmer — light hits the top of water
        const topGrad = this.bgCtx.createLinearGradient(0, 0, 0, h * 0.18);
        topGrad.addColorStop(0, 'rgba(100, 210, 240, 0.22)');
        topGrad.addColorStop(1, 'rgba(100, 210, 240, 0)');
        this.bgCtx.fillStyle = topGrad;
        this.bgCtx.fillRect(0, 0, w, h * 0.18);
        
        // Deep floor glow — cool blue reflection at the bottom
        const bottomGrad = this.bgCtx.createLinearGradient(0, h * 0.75, 0, h);
        bottomGrad.addColorStop(0, 'rgba(0, 80, 130, 0)');
        bottomGrad.addColorStop(1, 'rgba(0, 60, 110, 0.35)');
        this.bgCtx.fillStyle = bottomGrad;
        this.bgCtx.fillRect(0, h * 0.75, w, h * 0.25);
        
        // Bioluminescent particles — tiny glowing dots in deep water
        for(let i = 0; i < 150; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = Math.random() * 1.1 + 0.15;
            const alpha = Math.random() * 0.45 + 0.08;
            this.bgCtx.globalAlpha = alpha;
            // Cyan-white glow for particles
            this.bgCtx.fillStyle = Math.random() > 0.5 ? '#a0eeff' : '#ffffff';
            this.bgCtx.beginPath();
            this.bgCtx.arc(x, y, r, 0, Math.PI * 2);
            this.bgCtx.fill();
        }
        this.bgCtx.globalAlpha = 1.0;
    }
    
    /* ─── BUBBLE SYSTEM ─────────────────────────────────────── */
    spawnBubble(x, y, count = 1) {
        for (let i = 0; i < count; i++) {
            if (this.bubbles.length >= this.MAX_BUBBLES) break;
            const r = Math.random() * 4 + 1.5;          // radius 1.5 – 5.5px
            const vy = -(Math.random() * 0.5 + 0.25);   // rise speed
            const vx = (Math.random() - 0.5) * 0.3;     // gentle horizontal sway
            this.bubbles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y || window.innerHeight,
                r,
                vx,
                vy,
                vxBase: vx,
                phase: Math.random() * Math.PI * 2,      // sway phase
                alpha: Math.random() * 0.35 + 0.15,     // 0.15 – 0.5
                born: performance.now()
            });
        }
    }
    
    renderBubbles(t) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.bubbleCanvas.width = w;
        this.bubbleCanvas.height = h;
        const ctx = this.bCtx;
        ctx.clearRect(0, 0, w, h);
        
        const now = performance.now();
        
        // Auto-spawn ambient rising bubbles from the bottom
        if (now - this.lastAutoSpawn > 400 && this.bubbles.length < this.MAX_BUBBLES) {
            const bx = Math.random() * w;
            this.spawnBubble(bx, h + 5, Math.ceil(Math.random() * 2));
            this.lastAutoSpawn = now;
        }
        
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            
            // Sway side-to-side using sine wave
            b.vx = b.vxBase + Math.sin(t * 1.2 + b.phase) * 0.18;
            b.x += b.vx;
            b.y += b.vy;
            
            // Fade out as bubble approaches surface (top 15% of screen)
            const depthFade = Math.min(1, b.y / (h * 0.15));
            const age = (now - b.born) / 1000;
            const ageFade = Math.max(0, 1 - age / 18); // fade over 18s
            const a = b.alpha * depthFade * ageFade;
            
            // Remove when off screen or fully faded
            if (b.y < -b.r * 2 || a <= 0.01) {
                this.bubbles.splice(i, 1);
                continue;
            }
            
            // Draw bubble: translucent filled circle
            ctx.save();
            ctx.globalAlpha = a;
            
            // Main bubble body
            const grad = ctx.createRadialGradient(
                b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05,
                b.x, b.y, b.r
            );
            grad.addColorStop(0,   'rgba(200, 245, 255, 0.9)');
            grad.addColorStop(0.4, 'rgba(80, 200, 240, 0.4)');
            grad.addColorStop(1,   'rgba(20, 140, 200, 0.1)');
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Bubble ring (outline)
            ctx.strokeStyle = 'rgba(150, 230, 255, 0.6)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
            
            // Specular highlight (tiny white glint top-left)
            ctx.globalAlpha = a * 0.8;
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fill();
            
            ctx.restore();
        }
    }

    resize() {
        if(this.raf) cancelAnimationFrame(this.raf);
        
        this.drawBackground();
        
        this.cols = Math.ceil(window.innerWidth / this.SCALE) + 2;
        this.rows = Math.ceil(window.innerHeight / this.SCALE) + 2;
        this.rippleCanvas.width  = this.cols;
        this.rippleCanvas.height = this.rows;
        this.bubbleCanvas.width  = window.innerWidth;
        this.bubbleCanvas.height = window.innerHeight;
        
        const size = this.cols * this.rows;
        this.buf0 = new Float32Array(size);
        this.buf1 = new Float32Array(size);
        this.imgData = this.ctx.createImageData(this.cols, this.rows);
        this.data = this.imgData.data;
        
        this.cCols = Math.ceil(window.innerWidth / this.CSCALE);
        this.cRows = Math.ceil(window.innerHeight / this.CSCALE);
        this.causticCanvas.width = this.cCols;
        this.causticCanvas.height = this.cRows;
        
        this.cImgData = this.cCtx.createImageData(this.cCols, this.cRows);
        this.cData = this.cImgData.data;
        
        this.loop();
    }
    
    drop(x, y, radius, strength) {
        const cx = x / this.SCALE;
        const cy = y / this.SCALE;
        const r = radius / this.SCALE;
        
        const ix = Math.floor(cx);
        const iy = Math.floor(cy);
        const fx = cx - ix;
        const fy = cy - iy;
        
        const w00 = (1 - fx) * (1 - fy);
        const w10 = fx * (1 - fy);
        const w01 = (1 - fx) * fy;
        const w11 = fx * fy;
        
        const radCeil = Math.ceil(r);
        
        for (let dy = -radCeil; dy <= radCeil; dy++) {
            for (let dx = -radCeil; dx <= radCeil; dx++) {
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < r) {
                    let falloff = Math.max(0, 1 - dist/r);
                    falloff = falloff * falloff;
                    
                    const val = strength * falloff;
                    const px = ix + dx;
                    const py = iy + dy;
                    
                    if (px >= 0 && px < this.cols - 1 && py >= 0 && py < this.rows - 1) {
                        this.buf0[px + py * this.cols] += val * w00;
                        this.buf0[px + 1 + py * this.cols] += val * w10;
                        this.buf0[px + (py + 1) * this.cols] += val * w01;
                        this.buf0[px + 1 + (py + 1) * this.cols] += val * w11;
                    }
                }
            }
        }
    }
    
    drawCaustics(t) {
        const w = this.cCols;
        const h = this.cRows;
        
        this.cData.fill(0);
        
        for (let y = 0; y < h; y++) {
            const yFrac = y / h;
            const yWeight = Math.max(0, (yFrac - 0.08) / 0.92);
            if (yWeight <= 0) continue;
            
            for (let x = 0; x < w; x++) {
                const v = (
                    Math.sin(x*0.018 + t*0.9)  * Math.cos(y*0.015 - t*0.7) +
                    Math.sin(x*0.025 - t*0.55) * Math.cos(y*0.022 + t*1.1) +
                    Math.sin(x*0.012 + y*0.014 + t*0.65) +
                    Math.cos(x*0.02  - y*0.016 - t*0.8)
                ) / 4.0;
                
                const sharp = Math.max(0, v - 0.28) / 0.72;
                if (sharp <= 0) continue;
                
                const brightness = Math.pow(sharp, 2.0) * yWeight;
                if (brightness > 0) {
                    const ptr = (x + y * w) * 4;
                    const c = brightness * 255;
                    this.cData[ptr] = c;
                    this.cData[ptr + 1] = c;
                    this.cData[ptr + 2] = c;
                    this.cData[ptr + 3] = brightness * 220;
                }
            }
        }
        this.cCtx.putImageData(this.cImgData, 0, 0);
    }
    
    updateRipple() {
        const w = this.cols;
        const h = this.rows;
        
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = x + y * w;
                this.buf1[i] = (this.buf0[i - w] + this.buf0[i + w] + this.buf0[i - 1] + this.buf0[i + 1]) * 0.5 - this.buf1[i];
                this.buf1[i] *= this.DAMPING;
            }
        }
    }
    
    renderRipple() {
        const w = this.cols;
        const h = this.rows;
        this.data.fill(0);
        
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = x + y * w;
                const slope = this.buf0[i + 1] - this.buf0[i - 1]; 
                const normal = this.buf0[i - w] - this.buf0[i + w];
                
                let light = Math.max(0, Math.min(255, 128 + slope * 3 + normal * 1.5));
                let alpha = Math.max(0, Math.min(160, Math.abs(slope) * 30 + Math.abs(normal) * 15));
                
                if (alpha > 0) {
                    const ptr = i * 4;
                    this.data[ptr] = light;
                    this.data[ptr + 1] = light;
                    this.data[ptr + 2] = light;
                    this.data[ptr + 3] = alpha;
                }
            }
        }
        
        this.ctx.putImageData(this.imgData, 0, 0);
        
        const tmp = this.buf0;
        this.buf0 = this.buf1;
        this.buf1 = tmp;
    }

    loop() {
        const t = (performance.now() - this.startTime) / 1000;
        if (this.mouseX >= 0) {
            this.drop(this.mouseX, this.mouseY, this.MOUSE_RADIUS, this.MOUSE_STRENGTH);
            // Occasionally spawn a tiny bubble at the mouse ripple point
            if (Math.random() < 0.06) {
                this.spawnBubble(this.mouseX, this.mouseY, 1);
            }
        }
        
        this.drawCaustics(t);
        this.updateRipple();
        this.renderRipple();
        this.renderBubbles(t);
        
        this.raf = requestAnimationFrame(() => this.loop());
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.resize(), 100);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            const cursor = document.getElementById('cursor') || document.querySelector('.cursor-dot');
            if(cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });
        document.addEventListener('mouseleave', () => {
            this.mouseX = -999;
        });
        document.addEventListener('mousedown', (e) => {
            // Big click = burst of bubbles from impact point
            this.drop(e.clientX, e.clientY, this.CLICK_RADIUS, this.CLICK_STRENGTH);
            this.spawnBubble(e.clientX, e.clientY, Math.ceil(Math.random() * 5 + 3));
            const cursor = document.getElementById('cursor') || document.querySelector('.cursor-dot');
            if(cursor) {
                cursor.style.width = '22px';
                cursor.style.height = '22px';
            }
        });
        document.addEventListener('mouseup', () => {
            const cursor = document.getElementById('cursor') || document.querySelector('.cursor-dot');
            if(cursor) {
                cursor.style.width = '14px';
                cursor.style.height = '14px';
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.mouseX = e.touches[0].clientX;
            this.mouseY = e.touches[0].clientY;
            this.drop(this.mouseX, this.mouseY, this.MOUSE_RADIUS, this.MOUSE_STRENGTH);
        }, { passive: false });
        
        document.addEventListener('touchstart', (e) => {
            this.drop(e.touches[0].clientX, e.touches[0].clientY, this.CLICK_RADIUS, this.CLICK_STRENGTH);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let container = document.querySelector('.hero-tide-background');
    if (container) new WaterRipple(container);
});
