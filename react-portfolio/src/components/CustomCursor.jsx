import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  
  useEffect(() => {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let outlineX = targetX;
    let outlineY = targetY;
    let requestRef;
    let lastSparkTime = 0;

    const createSpark = (x, y) => {
      const spark = document.createElement('div');
      spark.className = 'cursor-spark';
      const size = Math.random() * 4 + 3;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      const colors = ['#c8b97a', '#ffd700', '#7ab5c8', '#a8d8e8'];
      spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      const tx = (Math.random() - 0.5) * 60;
      const ty = (Math.random() - 0.5) * 60;
      spark.style.setProperty('--tx', `${tx}px`);
      spark.style.setProperty('--ty', `${ty}px`);
      spark.style.boxShadow = `0 0 8px ${spark.style.backgroundColor}`;
      document.body.appendChild(spark);
      setTimeout(() => { if (spark.parentNode) spark.remove(); }, 600);
    };

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${targetX}px`;
        dotRef.current.style.top = `${targetY}px`;
      }

      const now = Date.now();
      if (now - lastSparkTime > 25) {
        createSpark(targetX, targetY);
        if (Math.random() > 0.5) createSpark(targetX, targetY);
        lastSparkTime = now;
      }
    };

    const animate = () => {
      const distX = targetX - outlineX;
      const distY = targetY - outlineY;
      
      outlineX += distX * 0.15; // Smooth trailing LERP
      outlineY += distY * 0.15;
      
      if (outlineRef.current) {
        outlineRef.current.style.left = `${outlineX}px`;
        outlineRef.current.style.top = `${outlineY}px`;
      }
      
      requestRef = requestAnimationFrame(animate);
    };

    const onMouseEnter = () => {
      if (outlineRef.current) outlineRef.current.classList.add('hovered');
    };
    
    const onMouseLeave = () => {
      if (outlineRef.current) outlineRef.current.classList.remove('hovered');
    };

    // Use passive listener for performance
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    requestRef = requestAnimationFrame(animate);

    // Track interactable hover scaling
    const attachHoverListeners = () => {
      const interactables = document.querySelectorAll('a, button, input, .nav__link, .projects__button, .contact__button, .scrollup, .qualification__button');
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });
    };

    attachHoverListeners();
    const observer = new MutationObserver(() => {
      attachHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(requestRef);
      observer.disconnect();
      const interactables = document.querySelectorAll('a, button, input, .nav__link, .projects__button, .contact__button, .scrollup, .qualification__button');
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef}></div>
      <div className="cursor-outline" ref={outlineRef}></div>
    </>
  );
};

export default CustomCursor;
