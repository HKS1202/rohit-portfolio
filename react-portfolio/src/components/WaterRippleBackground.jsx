import React, { useRef, useEffect } from 'react';

const WaterRippleBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

        const createLayer = (className, zIndex) => {
            const layer = document.createElement('div');
            layer.className = className;
            layer.style.position = 'absolute';
            layer.style.inset = '0';
            layer.style.zIndex = String(zIndex);
            layer.style.pointerEvents = 'none';
            container.appendChild(layer);
            return layer;
        };

        const parallaxFar = createLayer('water-parallax-layer water-parallax-layer--far', 0);
        const parallaxMid = createLayer('water-parallax-layer water-parallax-layer--mid', 1);

        const bubblesLayer = createLayer('water-bubbles-layer', 3);
        const bubbleCount = 28;
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('span');
            bubble.className = 'water-bubble-particle';
            bubble.style.setProperty('--x', `${Math.random() * 100}%`);
            bubble.style.setProperty('--size', `${Math.random() * 14 + 8}px`);
            bubble.style.setProperty('--duration', `${Math.random() * 9 + 11}s`);
            bubble.style.setProperty('--delay', `${Math.random() * -18}s`);
            bubble.style.setProperty('--drift', `${(Math.random() * 2 - 1) * 48}px`);
            bubblesLayer.appendChild(bubble);
        }

        const lightRaysLayer = createLayer('water-light-rays-layer', 4);
        const causticOverlayLayer = createLayer('water-caustic-overlay-layer', 5);
    
        // Canvas 1 (bgCanvas) - z-index 2
    const bgCanvas = document.createElement('canvas');
    bgCanvas.style.position = 'absolute';
        bgCanvas.style.zIndex = '2';
    bgCanvas.style.left = '0';
    bgCanvas.style.top = '0';
    bgCanvas.style.width = '100%';
    bgCanvas.style.height = '100%';
        bgCanvas.style.pointerEvents = 'none';
    container.appendChild(bgCanvas);
    const bgCtx = bgCanvas.getContext('2d', { alpha: false });

        // Canvas 1.5 (causticCanvas) - z-index 6
    const causticCanvas = document.createElement('canvas');
    causticCanvas.style.position = 'absolute';
        causticCanvas.style.zIndex = '6';
    causticCanvas.style.left = '0';
    causticCanvas.style.top = '0';
    causticCanvas.style.width = '100%';
    causticCanvas.style.height = '100%';
    causticCanvas.style.mixBlendMode = 'screen';
    causticCanvas.style.opacity = '0';
        causticCanvas.style.pointerEvents = 'none';
    container.appendChild(causticCanvas);
    const cCtx = causticCanvas.getContext('2d', { willReadFrequently: true });

        // Canvas 2 (rippleCanvas) - z-index 7
    const rippleCanvas = document.createElement('canvas');
    rippleCanvas.style.position = 'absolute';
        rippleCanvas.style.zIndex = '7';
    rippleCanvas.style.left = '0';
    rippleCanvas.style.top = '0';
    rippleCanvas.style.width = '100%';
    rippleCanvas.style.height = '100%';
    rippleCanvas.style.mixBlendMode = 'overlay';
    rippleCanvas.style.opacity = '0.45';
        rippleCanvas.style.pointerEvents = 'none';
    container.appendChild(rippleCanvas);
    const ctx = rippleCanvas.getContext('2d', { willReadFrequently: true });

    const DAMPING = 0.994;
    const SCALE = 2;
    const CSCALE = 4;
    const MOUSE_RADIUS = 13;
    const MOUSE_STRENGTH = 85;
    const CLICK_RADIUS = 80;
    const CLICK_STRENGTH = 300;

    let cols = 0, rows = 0;
    let cCols = 0, cRows = 0;
    let buf0, buf1, imgData, data;
    let cImgData, cData;
    let rafId, resizeTimer;
    let mouseX = -999;
    let mouseY = -999;
        let scrollY = 0;
    
    const startTime = performance.now();

        const applyParallax = () => {
            parallaxFar.style.transform = `translate3d(0, ${scrollY * 0.1}px, 0)`;
            parallaxMid.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0)`;
            bubblesLayer.style.transform = `translate3d(0, ${scrollY * 0.13}px, 0)`;
            lightRaysLayer.style.transform = `translate3d(0, ${scrollY * 0.07}px, 0)`;
            causticOverlayLayer.style.transform = `translate3d(0, ${scrollY * 0.24}px, 0)`;
        };

    const drawBackground = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        bgCanvas.width = w;
        bgCanvas.height = h;
        
        const grad = bgCtx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#61d7ef');
        grad.addColorStop(0.22, '#31c0df');
        grad.addColorStop(0.5, '#169ec3');
        grad.addColorStop(0.78, '#1f9fbe');
        grad.addColorStop(1, '#73d3e7');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, w, h);
        
        const topGrad = bgCtx.createLinearGradient(0, 0, 0, h * 0.22);
        topGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
        topGrad.addColorStop(1, 'rgba(255,255,255,0)');
        bgCtx.fillStyle = topGrad;
        bgCtx.fillRect(0, 0, w, h * 0.22);
        
        const bottomGrad = bgCtx.createLinearGradient(0, h * 0.56, 0, h);
        bottomGrad.addColorStop(0, 'rgba(255,255,255,0)');
        bottomGrad.addColorStop(1, 'rgba(255,255,255,0.22)');
        bgCtx.fillStyle = bottomGrad;
        bgCtx.fillRect(0, h * 0.56, w, h * 0.44);

        const centerBlend = bgCtx.createRadialGradient(
            w * 0.5,
            h * 0.62,
            Math.min(w, h) * 0.08,
            w * 0.5,
            h * 0.62,
            Math.max(w, h) * 0.56
        );
        centerBlend.addColorStop(0, 'rgba(255,255,255,0.1)');
        centerBlend.addColorStop(1, 'rgba(255,255,255,0)');
        bgCtx.fillStyle = centerBlend;
        bgCtx.fillRect(0, 0, w, h);
        
        bgCtx.fillStyle = 'white';
        for(let i=0; i<115; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = Math.random() * 1.2 + 0.2;
            const alpha = Math.random() * 0.42 + 0.08;
            bgCtx.globalAlpha = alpha;
            bgCtx.beginPath();
            bgCtx.arc(x, y, r, 0, Math.PI * 2);
            bgCtx.fill();
        }
        bgCtx.globalAlpha = 1.0;
    };

    const resize = () => {
        if(rafId) cancelAnimationFrame(rafId);
        
        drawBackground();
        
        cols = Math.ceil(window.innerWidth / SCALE) + 2;
        rows = Math.ceil(window.innerHeight / SCALE) + 2;
        rippleCanvas.width = cols;
        rippleCanvas.height = rows;
        
        const size = cols * rows;
        buf0 = new Float32Array(size);
        buf1 = new Float32Array(size);
        imgData = ctx.createImageData(cols, rows);
        data = imgData.data;
        
        cCols = Math.ceil(window.innerWidth / CSCALE);
        cRows = Math.ceil(window.innerHeight / CSCALE);
        causticCanvas.width = cCols;
        causticCanvas.height = cRows;
        
        cImgData = cCtx.createImageData(cCols, cRows);
        cData = cImgData.data;
        
        loop();
    };

    const drop = (x, y, radius, strength) => {
        const cx = x / SCALE;
        const cy = y / SCALE;
        const r = radius / SCALE;
        
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
                    
                    if (px >= 0 && px < cols - 1 && py >= 0 && py < rows - 1) {
                        buf0[px + py * cols] += val * w00;
                        buf0[px + 1 + py * cols] += val * w10;
                        buf0[px + (py + 1) * cols] += val * w01;
                        buf0[px + 1 + (py + 1) * cols] += val * w11;
                    }
                }
            }
        }
    };

    const drawCaustics = (t) => {
        const w = cCols;
        const h = cRows;
        
        cData.fill(0);
        
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
                    cData[ptr] = c;
                    cData[ptr + 1] = c;
                    cData[ptr + 2] = c;
                    cData[ptr + 3] = brightness * 220;
                }
            }
        }
        cCtx.putImageData(cImgData, 0, 0);
    };

    const updateRipple = () => {
        for (let y = 1; y < rows - 1; y++) {
            for (let x = 1; x < cols - 1; x++) {
                const i = x + y * cols;
                buf1[i] = (buf0[i - cols] + buf0[i + cols] + buf0[i - 1] + buf0[i + 1]) * 0.5 - buf1[i];
                buf1[i] *= DAMPING;
            }
        }
    };
    
    const renderRipple = () => {
        data.fill(0);
        for (let y = 1; y < rows - 1; y++) {
            for (let x = 1; x < cols - 1; x++) {
                const i = x + y * cols;
                const slope = buf0[i + 1] - buf0[i - 1]; 
                const normal = buf0[i - cols] - buf0[i + cols];
                
                let light = Math.max(0, Math.min(255, 128 + slope * 3 + normal * 1.5));
                let alpha = Math.max(0, Math.min(160, Math.abs(slope) * 30 + Math.abs(normal) * 15));
                
                if (alpha > 0) {
                    const ptr = i * 4;
                    data[ptr] = light;
                    data[ptr + 1] = light;
                    data[ptr + 2] = light;
                    data[ptr + 3] = alpha;
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
        
        const tmp = buf0;
        buf0 = buf1;
        buf1 = tmp;
    };

    const loop = () => {
        const t = (performance.now() - startTime) / 1000;
        if (mouseX >= 0) {
            drop(mouseX, mouseY, MOUSE_RADIUS, MOUSE_STRENGTH);
        }
        drawCaustics(t);
        updateRipple();
        renderRipple();
        rafId = requestAnimationFrame(loop);
    };

    const handleMouseMove = (e) => { 
        mouseX = e.clientX; 
        mouseY = e.clientY; 
        const cursor = document.getElementById('cursor') || document.querySelector('.cursor-dot');
        if(cursor) {
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        }
    };
    
    const handleMouseLeave = () => { mouseX = -999; };
    
    const handleMouseDown = (e) => { 
        drop(e.clientX, e.clientY, CLICK_RADIUS, CLICK_STRENGTH); 
        const cursor = document.getElementById('cursor') || document.querySelector('.cursor-dot');
        if(cursor) {
            cursor.style.width = '22px';
            cursor.style.height = '22px';
        }
    };
    
    const handleMouseUp = () => {
        const cursor = document.getElementById('cursor') || document.querySelector('.cursor-dot');
        if(cursor) {
            cursor.style.width = '14px';
            cursor.style.height = '14px';
        }
    };
    
    const handleTouchMove = (e) => {
        e.preventDefault();
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        drop(mouseX, mouseY, MOUSE_RADIUS, MOUSE_STRENGTH);
    };
    const handleTouchStart = (e) => { drop(e.touches[0].clientX, e.touches[0].clientY, CLICK_RADIUS, CLICK_STRENGTH); };
    const handleTouchEnd = () => { mouseX = -999; };

    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
    };

    const handleScroll = () => {
        scrollY = window.scrollY || window.pageYOffset || 0;
        applyParallax();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    resize();
    handleScroll();

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
        cancelAnimationFrame(rafId);
        if(containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div 
      className="hero-tide-background" 
      ref={containerRef} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, overflow: 'hidden' }}
    />
  );
};

export default WaterRippleBackground;
