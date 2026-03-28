/* ═══════════════════════════════════════════════════════════════
   DEEP WATER BACKGROUND — Rohit Kumar Portfolio
   Layers (bottom → top):
     bgCanvas      – depth-responsive ocean gradient
     causticCanvas – animated caustic light patterns
     rippleCanvas  – Navier-Stokes wave simulation
     bubbleCanvas  – rising soap-bubble particles
     particleCanvas– animated bioluminescent glow particles
   Interactions:
     mousemove → continuous ripples + particle spawning
     click     → surge ripple + bubble burst + ring burst
   NO god-rays layer.
═══════════════════════════════════════════════════════════════ */

class WaterRipple {
    constructor(container) {
        this.container = container;
        this.container.innerHTML = '';

        // ── Canvas 0: Background gradient ──────────────────────
        this.bgCanvas = document.createElement('canvas');
        this._applyCanvasStyle(this.bgCanvas, '0');
        this.container.appendChild(this.bgCanvas);
        this.bgCtx = this.bgCanvas.getContext('2d', { alpha: false });

        // ── Canvas 1: Caustics ─────────────────────────────────
        this.causticCanvas = document.createElement('canvas');
        this._applyCanvasStyle(this.causticCanvas, '1');
        this.causticCanvas.style.mixBlendMode = 'screen';
        this.causticCanvas.style.opacity = '0.55';
        this.container.appendChild(this.causticCanvas);
        this.cCtx = this.causticCanvas.getContext('2d', { willReadFrequently: true });

        // ── Canvas 2: Ripple simulation ────────────────────────
        this.rippleCanvas = document.createElement('canvas');
        this._applyCanvasStyle(this.rippleCanvas, '2');
        this.rippleCanvas.style.mixBlendMode = 'overlay';
        this.rippleCanvas.style.opacity = '0.5';
        this.container.appendChild(this.rippleCanvas);
        this.ctx = this.rippleCanvas.getContext('2d', { willReadFrequently: true });

        // ── Canvas 3: Bubbles ──────────────────────────────────
        this.bubbleCanvas = document.createElement('canvas');
        this._applyCanvasStyle(this.bubbleCanvas, '3');
        this.bubbleCanvas.style.pointerEvents = 'none';
        this.container.appendChild(this.bubbleCanvas);
        this.bCtx = this.bubbleCanvas.getContext('2d');

        // ── Canvas 4: Bioluminescent particles ─────────────────
        this.particleCanvas = document.createElement('canvas');
        this._applyCanvasStyle(this.particleCanvas, '4');
        this.particleCanvas.style.mixBlendMode = 'screen';
        this.particleCanvas.style.pointerEvents = 'none';
        this.container.appendChild(this.particleCanvas);
        this.pCtx = this.particleCanvas.getContext('2d');

        // ── Simulation constants ───────────────────────────────
        this.DAMPING        = 0.994;
        this.SCALE          = 2;
        this.CSCALE         = 4;
        this.MOUSE_RADIUS   = 13;
        this.MOUSE_STRENGTH = 85;
        this.CLICK_RADIUS   = 80;
        this.CLICK_STRENGTH = 300;
        this.MAX_BUBBLES    = 60;
        this.MAX_PARTICLES  = 120;

        // ── State ──────────────────────────────────────────────
        this.cols = 0;  this.rows  = 0;
        this.cCols = 0; this.cRows = 0;
        this.mouseX = -999; this.mouseY = -999;
        this.mouseVX = 0;   this.mouseVY = 0;
        this._prevMX = 0;   this._prevMY = 0;
        this.depth = 0;     // 0-1, cursor Y position normalised

        this.bubbles   = [];
        this.particles = [];
        this.clickBursts = [];
        this.lastAutoSpawn = 0;

        this.startTime = performance.now();

        this.bindEvents();
        this.resize();
        this._initParticles();
        this.loop();
    }

    /* ── helper ─────────────────────────────────────────────── */
    _applyCanvasStyle(canvas, zIndex) {
        canvas.style.cssText = `
            position:absolute; z-index:${zIndex};
            left:0; top:0; width:100%; height:100%;
        `;
    }

    /* ═══════════════════════════════════════════════════════════
       LAYER 0 – Background
    ═══════════════════════════════════════════════════════════ */
    drawBackground(dep) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.bgCanvas.width  = w;
        this.bgCanvas.height = h;
        const ctx = this.bgCtx;

        // Depth-responsive gradient:
        // shallow → deep midnight navy at top, darker abyss at bottom.
        // As dep increases the top colour shifts deeper.
        const topR  = Math.round(14 - dep * 10);
        const topG  = Math.round(42 - dep * 22);
        const topB  = Math.round(74 - dep * 30);

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0,    `rgb(${topR},${topG},${topB})`);
        grad.addColorStop(0.25, '#0a3d5c');
        grad.addColorStop(0.50, '#073d58');
        grad.addColorStop(0.75, '#052e47');
        grad.addColorStop(1,    '#061e38');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Surface shimmer (top 18%)
        const shimmer = ctx.createLinearGradient(0, 0, 0, h * 0.18);
        shimmer.addColorStop(0, `rgba(100,210,240,${0.22 - dep * 0.12})`);
        shimmer.addColorStop(1, 'rgba(100,210,240,0)');
        ctx.fillStyle = shimmer;
        ctx.fillRect(0, 0, w, h * 0.18);

        // Deep floor glow
        const floorGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
        floorGrad.addColorStop(0, 'rgba(0,80,130,0)');
        floorGrad.addColorStop(1, 'rgba(0,60,110,0.35)');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, h * 0.75, w, h * 0.25);
    }

    /* ═══════════════════════════════════════════════════════════
       LAYER 1 – Caustics
    ═══════════════════════════════════════════════════════════ */
    drawCaustics(t) {
        const w = this.cCols;
        const h = this.cRows;
        this.cData.fill(0);

        for (let y = 0; y < h; y++) {
            const yFrac  = y / h;
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
                    this.cData[ptr]     = c;
                    this.cData[ptr + 1] = c;
                    this.cData[ptr + 2] = c;
                    this.cData[ptr + 3] = brightness * 220;
                }
            }
        }
        this.cCtx.putImageData(this.cImgData, 0, 0);
    }

    /* ═══════════════════════════════════════════════════════════
       LAYER 2 – Ripple simulation
    ═══════════════════════════════════════════════════════════ */
    drop(x, y, radius, strength) {
        const cx = x / this.SCALE;
        const cy = y / this.SCALE;
        const r  = radius / this.SCALE;

        const ix = Math.floor(cx),  iy = Math.floor(cy);
        const fx = cx - ix,          fy = cy - iy;

        const w00 = (1 - fx) * (1 - fy);
        const w10 =      fx  * (1 - fy);
        const w01 = (1 - fx) *      fy;
        const w11 =      fx  *      fy;

        const radCeil = Math.ceil(r);
        for (let dy = -radCeil; dy <= radCeil; dy++) {
            for (let dx = -radCeil; dx <= radCeil; dx++) {
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < r) {
                    let falloff = Math.max(0, 1 - dist / r);
                    falloff = falloff * falloff;
                    const val = strength * falloff;
                    const px = ix + dx, py = iy + dy;
                    if (px >= 0 && px < this.cols - 1 && py >= 0 && py < this.rows - 1) {
                        this.buf0[px     +  py      * this.cols] += val * w00;
                        this.buf0[px + 1 +  py      * this.cols] += val * w10;
                        this.buf0[px     + (py + 1) * this.cols] += val * w01;
                        this.buf0[px + 1 + (py + 1) * this.cols] += val * w11;
                    }
                }
            }
        }
    }

    updateRipple() {
        const w = this.cols, h = this.rows;
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = x + y * w;
                this.buf1[i] = (
                    this.buf0[i - w] + this.buf0[i + w] +
                    this.buf0[i - 1] + this.buf0[i + 1]
                ) * 0.5 - this.buf1[i];
                this.buf1[i] *= this.DAMPING;
            }
        }
    }

    renderRipple() {
        const w = this.cols, h = this.rows;
        this.data.fill(0);
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = x + y * w;
                const slope  = this.buf0[i + 1] - this.buf0[i - 1];
                const normal = this.buf0[i - w]  - this.buf0[i + w];
                const light  = Math.max(0, Math.min(255, 128 + slope * 3 + normal * 1.5));
                const alpha  = Math.max(0, Math.min(160, Math.abs(slope) * 30 + Math.abs(normal) * 15));
                if (alpha > 0) {
                    const ptr = i * 4;
                    this.data[ptr] = this.data[ptr+1] = this.data[ptr+2] = light;
                    this.data[ptr + 3] = alpha;
                }
            }
        }
        this.ctx.putImageData(this.imgData, 0, 0);
        const tmp = this.buf0; this.buf0 = this.buf1; this.buf1 = tmp;
    }

    /* ═══════════════════════════════════════════════════════════
       LAYER 3 – Bubbles
    ═══════════════════════════════════════════════════════════ */
    spawnBubble(x, y, count = 1) {
        for (let i = 0; i < count; i++) {
            if (this.bubbles.length >= this.MAX_BUBBLES) break;
            const r  = Math.random() * 4 + 1.5;
            const vy = -(Math.random() * 0.5 + 0.25);
            const vx = (Math.random() - 0.5) * 0.3;
            this.bubbles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y || window.innerHeight,
                r, vx, vy, vxBase: vx,
                phase: Math.random() * Math.PI * 2,
                alpha: Math.random() * 0.35 + 0.15,
                born:  performance.now()
            });
        }
    }

    renderBubbles(t) {
        const w = window.innerWidth, h = window.innerHeight;
        this.bubbleCanvas.width  = w;
        this.bubbleCanvas.height = h;
        const ctx = this.bCtx;
        ctx.clearRect(0, 0, w, h);

        const now = performance.now();
        if (now - this.lastAutoSpawn > 400 && this.bubbles.length < this.MAX_BUBBLES) {
            this.spawnBubble(Math.random() * w, h + 5, Math.ceil(Math.random() * 2));
            this.lastAutoSpawn = now;
        }

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.vx = b.vxBase + Math.sin(t * 1.2 + b.phase) * 0.18;
            b.x += b.vx;
            b.y += b.vy;

            const depthFade = Math.min(1, b.y / (h * 0.15));
            const age = (now - b.born) / 1000;
            const ageFade = Math.max(0, 1 - age / 18);
            const a = b.alpha * depthFade * ageFade;

            if (b.y < -b.r * 2 || a <= 0.01) { this.bubbles.splice(i, 1); continue; }

            ctx.save();
            ctx.globalAlpha = a;
            const grad = ctx.createRadialGradient(
                b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05,
                b.x, b.y, b.r
            );
            grad.addColorStop(0,   'rgba(200,245,255,0.9)');
            grad.addColorStop(0.4, 'rgba(80,200,240,0.4)');
            grad.addColorStop(1,   'rgba(20,140,200,0.1)');
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(150,230,255,0.6)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.globalAlpha = a * 0.8;
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fill();
            ctx.restore();
        }
    }

    /* ═══════════════════════════════════════════════════════════
       LAYER 4 – Bioluminescent particles
    ═══════════════════════════════════════════════════════════ */
    _initParticles() {
        for (let i = 0; i < 70; i++) this._spawnParticle(null, null);
    }

    _spawnParticle(x, y) {
        if (this.particles.length >= this.MAX_PARTICLES) return;
        const hue = 160 + Math.random() * 60;   // teal → cyan
        this.particles.push({
            x:     x  ?? Math.random() * window.innerWidth,
            y:     y  ?? window.innerHeight * (0.2 + Math.random() * 0.8),
            vx:    (Math.random() - 0.5) * 0.5,
            vy:    -(0.3 + Math.random() * 1.0),
            life:  1,
            decay: 0.003 + Math.random() * 0.005,
            size:  1.5 + Math.random() * 3.5,
            hue,
            drift: (Math.random() - 0.5) * 0.012,
            phase: Math.random() * Math.PI * 2,
            glow:  6 + Math.random() * 12,
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.phase += 0.025;
            p.vx    += p.drift;
            p.x     += p.vx;
            p.y     += p.vy;
            p.life  -= p.decay;
            if (p.life <= 0 || p.y < -20) {
                this.particles.splice(i, 1);
                this._spawnParticle(null, null);
            }
        }
        // Spawn near mouse when moving quickly
        const spd = Math.sqrt(this.mouseVX * this.mouseVX + this.mouseVY * this.mouseVY);
        if (spd > 3 && Math.random() < 0.3 && this.mouseX > 0) {
            this._spawnParticle(
                this.mouseX + (Math.random() - 0.5) * 20,
                this.mouseY + (Math.random() - 0.5) * 20
            );
        }
    }

    renderParticles() {
        const w = window.innerWidth, h = window.innerHeight;
        this.particleCanvas.width  = w;
        this.particleCanvas.height = h;
        const ctx = this.pCtx;
        ctx.clearRect(0, 0, w, h);

        for (const p of this.particles) {
            const wobble = Math.sin(p.phase) * 1.8;
            ctx.save();
            ctx.globalAlpha  = p.life * (0.55 + 0.45 * Math.abs(Math.sin(p.phase)));
            ctx.shadowColor  = `hsl(${p.hue},100%,70%)`;
            ctx.shadowBlur   = p.glow;
            ctx.fillStyle    = `hsl(${p.hue},100%,80%)`;
            ctx.beginPath();
            ctx.arc(p.x + wobble, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Click burst rings (drawn on particle canvas with screen blend)
        for (let i = this.clickBursts.length - 1; i >= 0; i--) {
            const b   = this.clickBursts[i];
            b.t++;
            const prog  = b.t / 55;
            const r     = prog * b.max;
            const alpha = (1 - prog) * 0.75;
            if (prog >= 1) { this.clickBursts.splice(i, 1); continue; }

            ctx.save();
            ctx.strokeStyle = `rgba(0,255,204,${alpha})`;
            ctx.lineWidth   = 2.2 * (1 - prog);
            ctx.shadowColor = 'rgba(0,255,204,0.8)';
            ctx.shadowBlur  = 16;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(0,212,255,${alpha * 0.5})`;
            ctx.lineWidth   = 1.4 * (1 - prog);
            ctx.beginPath();
            ctx.arc(b.x, b.y, r * 0.62, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    /* ═══════════════════════════════════════════════════════════
       RESIZE / INIT
    ═══════════════════════════════════════════════════════════ */
    resize() {
        if (this.raf) cancelAnimationFrame(this.raf);

        this.drawBackground(this.depth);

        this.cols = Math.ceil(window.innerWidth  / this.SCALE) + 2;
        this.rows = Math.ceil(window.innerHeight / this.SCALE) + 2;
        this.rippleCanvas.width  = this.cols;
        this.rippleCanvas.height = this.rows;

        const size = this.cols * this.rows;
        this.buf0    = new Float32Array(size);
        this.buf1    = new Float32Array(size);
        this.imgData = this.ctx.createImageData(this.cols, this.rows);
        this.data    = this.imgData.data;

        this.cCols = Math.ceil(window.innerWidth  / this.CSCALE);
        this.cRows = Math.ceil(window.innerHeight / this.CSCALE);
        this.causticCanvas.width  = this.cCols;
        this.causticCanvas.height = this.cRows;
        this.cImgData = this.cCtx.createImageData(this.cCols, this.cRows);
        this.cData    = this.cImgData.data;

        this.bubbleCanvas.width  = window.innerWidth;
        this.bubbleCanvas.height = window.innerHeight;

        this.loop();
    }

    /* ═══════════════════════════════════════════════════════════
       MAIN LOOP
    ═══════════════════════════════════════════════════════════ */
    loop() {
        const t = (performance.now() - this.startTime) / 1000;

        // Smooth depth with lerp based on cursor Y
        if (this.mouseY > 0) {
            const targetDepth = this.mouseY / window.innerHeight;
            this.depth += (targetDepth - this.depth) * 0.015;
        }

        // Ripple from cursor
        if (this.mouseX >= 0) {
            this.drop(this.mouseX, this.mouseY, this.MOUSE_RADIUS, this.MOUSE_STRENGTH);
            if (Math.random() < 0.06) this.spawnBubble(this.mouseX, this.mouseY, 1);
        }

        // Redraw the bg every ~2s to save GPU (depth colour changes slowly)
        if (!this._lastBgT || t - this._lastBgT > 2) {
            this.drawBackground(this.depth);
            this._lastBgT = t;
        }

        this.drawCaustics(t);
        this.updateRipple();
        this.renderRipple();
        this.renderBubbles(t);
        this.updateParticles();
        this.renderParticles();

        this.raf = requestAnimationFrame(() => this.loop());
    }

    /* ═══════════════════════════════════════════════════════════
       EVENT BINDING
    ═══════════════════════════════════════════════════════════ */
    bindEvents() {
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.resize(), 100);
        });

        document.addEventListener('mousemove', e => {
            this.mouseVX = e.clientX - this._prevMX;
            this.mouseVY = e.clientY - this._prevMY;
            this._prevMX = this.mouseX;
            this._prevMY = this.mouseY;
            this.mouseX  = e.clientX;
            this.mouseY  = e.clientY;

            // update cursor element
            const cur = document.querySelector('.cursor-dot');
            if (cur) { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }
        });

        document.addEventListener('mouseleave', () => { this.mouseX = -999; });

        document.addEventListener('mousedown', e => {
            this.drop(e.clientX, e.clientY, this.CLICK_RADIUS, this.CLICK_STRENGTH);
            this.spawnBubble(e.clientX, e.clientY, Math.ceil(Math.random() * 5 + 3));
            // Add a click-burst ring
            this.clickBursts.push({ x: e.clientX, y: e.clientY, t: 0, max: 260 });

            const cur = document.querySelector('.cursor-dot');
            if (cur) { cur.style.width = '22px'; cur.style.height = '22px'; }
        });

        document.addEventListener('mouseup', () => {
            const cur = document.querySelector('.cursor-dot');
            if (cur) { cur.style.width = '14px'; cur.style.height = '14px'; }
        });

        document.addEventListener('touchmove', e => {
            e.preventDefault();
            this.mouseX = e.touches[0].clientX;
            this.mouseY = e.touches[0].clientY;
            this.drop(this.mouseX, this.mouseY, this.MOUSE_RADIUS, this.MOUSE_STRENGTH);
        }, { passive: false });

        document.addEventListener('touchstart', e => {
            const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
            this.drop(tx, ty, this.CLICK_RADIUS, this.CLICK_STRENGTH);
            this.spawnBubble(tx, ty, Math.ceil(Math.random() * 4 + 2));
            this.clickBursts.push({ x: tx, y: ty, t: 0, max: 260 });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.hero-tide-background');
    if (container) new WaterRipple(container);
});
