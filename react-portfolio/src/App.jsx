import React, { useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Qualification from './components/Qualification';
import Contact from './components/Contact';
import ScrollUp from './components/ScrollUp';
import WaterRippleBackground from './components/WaterRippleBackground';

const App = () => {
  useEffect(() => {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress)).toFixed(2)}%`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('.main .section'));
    if (sections.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return;
    }

    sections.forEach((section) => section.classList.add('section-reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -12% 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const root = document.documentElement;
    if (root.dataset.staggerLoaded !== '1') {
      const revealTargets = Array.from(document.querySelectorAll(
        '.home__title, .home__subtitle, .home__description, .home__data .button, .home__scroll, .home__img-wrapper, .section__title, .section__subtitle, .about__img, .about__box, .skills__content, .projects__card, .qualification__data, .contact__item, .contact__form-panel'
      ));

      revealTargets.forEach((element, index) => {
        element.animate(
          [
            { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' }
          ],
          {
            duration: 720,
            delay: 120 + index * 85,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both'
          }
        );
      });

      root.dataset.staggerLoaded = '1';
    }

    const cleanups = [];

    const buttons = Array.from(document.querySelectorAll('.button'));
    buttons.forEach((button) => {
      const handleClick = (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        button.style.setProperty('--ripple-x', `${x}px`);
        button.style.setProperty('--ripple-y', `${y}px`);

        button.classList.remove('ripple-active');
        void button.offsetWidth;
        button.classList.add('ripple-active');

        window.setTimeout(() => {
          button.classList.remove('ripple-active');
        }, 650);
      };

      button.addEventListener('click', handleClick);
      cleanups.push(() => {
        button.removeEventListener('click', handleClick);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // Unified 3D tilt + magnetic hover interaction for cards
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReducedMotion || !supportsHover) return;

    const cardSelectors = [
      '.about__box',
      '.skills__content',
      '.projects__card',
      '.qualification__data',
      '.contact__item',
      '.contact__form-panel'
    ].join(', ');

    const tiltCards = Array.from(document.querySelectorAll(cardSelectors));
    if (tiltCards.length === 0) return;

    const cardStates = new Map();
    const magneticRange = 240;
    const maxPull = 14;
    const maxTilt = 14;

    tiltCards.forEach((card) => {
      card.classList.add('cursor-tilt-card');
      const state = { hovered: false };
      cardStates.set(card, state);

      const handleMouseMove = (event) => {
        state.hovered = true;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const px = x / rect.width;
        const py = y / rect.height;

        const tiltY = (px - 0.5) * (maxTilt * 2);
        const tiltX = (0.5 - py) * (maxTilt * 2);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const pullX = Math.max(-maxPull, Math.min(maxPull, ((x - centerX) / (centerX || 1)) * maxPull * 0.55));
        const pullY = Math.max(-maxPull, Math.min(maxPull, ((y - centerY) / (centerY || 1)) * maxPull * 0.55));

        card.style.setProperty('--spot-x', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--spot-y', `${(py * 100).toFixed(1)}%`);
        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--pull-x', `${pullX.toFixed(2)}px`);
        card.style.setProperty('--pull-y', `${pullY.toFixed(2)}px`);
        card.classList.add('card-nearby');
        card.classList.add('card-active');
      };

      const handleMouseLeave = () => {
        state.hovered = false;
        card.style.setProperty('--pull-x', '0px');
        card.style.setProperty('--pull-y', '0px');
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--spot-x', '50%');
        card.style.setProperty('--spot-y', '50%');
        card.classList.remove('card-nearby');
        card.classList.remove('card-active');
      };

      state.handleMouseMove = handleMouseMove;
      state.handleMouseLeave = handleMouseLeave;
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    const handleGlobalMouseMove = (event) => {
      tiltCards.forEach((card) => {
        const state = cardStates.get(card);
        if (state.hovered) return;

        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance < magneticRange) {
          const influence = 1 - distance / magneticRange;
          const normX = dx / (rect.width / 2 || 1);
          const normY = dy / (rect.height / 2 || 1);
          const pullX = Math.max(-maxPull, Math.min(maxPull, normX * maxPull * influence * 1.2));
          const pullY = Math.max(-maxPull, Math.min(maxPull, normY * maxPull * influence * 1.2));

          card.style.setProperty('--pull-x', `${pullX.toFixed(2)}px`);
          card.style.setProperty('--pull-y', `${pullY.toFixed(2)}px`);
          card.classList.add('card-nearby');
        } else {
          card.style.setProperty('--pull-x', '0px');
          card.style.setProperty('--pull-y', '0px');
          card.classList.remove('card-nearby');
        }
      });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      tiltCards.forEach((card) => {
        const state = cardStates.get(card);
        if (state?.handleMouseMove) {
          card.removeEventListener('mousemove', state.handleMouseMove);
        }
        if (state?.handleMouseLeave) {
          card.removeEventListener('mouseleave', state.handleMouseLeave);
        }
        card.classList.remove('cursor-tilt-card');
        card.classList.remove('card-nearby');
        card.classList.remove('card-active');
        card.style.removeProperty('--pull-x');
        card.style.removeProperty('--pull-y');
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
        card.style.removeProperty('--spot-x');
        card.style.removeProperty('--spot-y');
        cardStates.delete(card);
      });
    };
  }, []);

  return (
    <>
      <div id="reading-progress" aria-hidden="true"></div>
      <WaterRippleBackground />
      <CustomCursor />
      <Header />
      
      <main className="main">
        <Home />
        <About />
        <Skills />
        <Projects />
        <Qualification />
        <Contact />
      </main>

      <ScrollUp />
    </>
  );
};

export default App;
