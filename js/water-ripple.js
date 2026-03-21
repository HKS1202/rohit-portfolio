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
        
        const grad = this.bgCtx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#5fd8f0');
        grad.addColorStop(0.15, '#2bbfe0');
        grad.addColorStop(0.45, '#0d9dc4');
        grad.addColorStop(0.75, '#0b8ab0');
        grad.addColorStop(1, '#7dd8ee');
        this.bgCtx.fillStyle = grad;
        this.bgCtx.fillRect(0, 0, w, h);
        
        const topGrad = this.bgCtx.createLinearGradient(0, 0, 0, h * 0.22);
        topGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
        topGrad.addColorStop(1, 'rgba(255,255,255,0)');
        this.bgCtx.fillStyle = topGrad;
        this.bgCtx.fillRect(0, 0, w, h * 0.22);
        
        const bottomGrad = this.bgCtx.createLinearGradient(0, h * 0.72, 0, h);
        bottomGrad.addColorStop(0, 'rgba(255,255,255,0)');
        bottomGrad.addColorStop(1, 'rgba(255,255,255,0.5)');
        this.bgCtx.fillStyle = bottomGrad;
        this.bgCtx.fillRect(0, h * 0.72, w, h * 0.28);
        
        this.bgCtx.fillStyle = 'white';
        for(let i=0; i<150; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = Math.random() * 1.2 + 0.2;
            const alpha = Math.random() * 0.6 + 0.1; 
            this.bgCtx.globalAlpha = alpha;
            this.bgCtx.beginPath();
            this.bgCtx.arc(x, y, r, 0, Math.PI * 2);
            this.bgCtx.fill();
        }
        this.bgCtx.globalAlpha = 1.0;
    }
    
    resize() {
        if(this.raf) cancelAnimationFrame(this.raf);
        
        this.drawBackground();
        
        this.cols = Math.ceil(window.innerWidth / this.SCALE) + 2;
        this.rows = Math.ceil(window.innerHeight / this.SCALE) + 2;
        this.rippleCanvas.width = this.cols;
        this.rippleCanvas.height = this.rows;
        
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
        }
        
        this.drawCaustics(t);
        this.updateRipple();
        this.renderRipple();
        
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
            this.drop(e.clientX, e.clientY, this.CLICK_RADIUS, this.CLICK_STRENGTH);
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
