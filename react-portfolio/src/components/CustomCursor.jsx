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

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${targetX}px`;
        dotRef.current.style.top = `${targetY}px`;
      }
    };

    const animate = () => {
      const distX = targetX - outlineX;
      const distY = targetY - outlineY;
      
      outlineX += distX * 0.15;
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

    const onClick = (e) => {
      const ring = document.createElement('span');
      ring.className = 'cursor-ripple-ring';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    requestRef = requestAnimationFrame(animate);

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
      window.removeEventListener('click', onClick);
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
