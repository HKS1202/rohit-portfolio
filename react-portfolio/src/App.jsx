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

    const tiltTargets = Array.from(document.querySelectorAll('.tilt-card'));
    const cleanups = [];

    tiltTargets.forEach((card) => {
      const handleMove = (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;
        const rotateY = ((x / rect.width) - 0.5) * 30;
        const rotateX = ((0.5 - y / rect.height) * 30);

        card.style.setProperty('--mouseX', `${px}%`);
        card.style.setProperty('--mouseY', `${py}%`);
        card.style.setProperty('--x', `${px}%`);
        card.style.setProperty('--y', `${py}%`);
        card.style.setProperty('--glowAlpha', '1');
        card.style.transform = `perspective(620px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-12px) scale(1.03)`;
      };

      const handleLeave = () => {
        card.style.setProperty('--glowAlpha', '0');
        card.style.transform = 'perspective(620px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
      };

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);

      cleanups.push(() => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      });
    });

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

  // Premium magnetic cursor pull + 3D tilt tracking for cards
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const cardSelectors = [
      '.about__box',
      '.skills__content',
      '.projects__card',
      '.qualification__data',
      '.contact__item'
    ].join(', ');

    const tiltCards = document.querySelectorAll(cardSelectors);
    const cardStates = new Map();
    const magneticRange = 210;
    const maxPull = 7;
    const maxTilt = 12;

    tiltCards.forEach((card) => {
      card.classList.add('cursor-tilt-card');
      cardStates.set(card, { hovered: false });

      card.addEventListener('mousemove', (event) => {
        const state = cardStates.get(card);
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

        card.style.setProperty('--spot-x', `${(px * 100).toFixed(2)}%`);
        card.style.setProperty('--spot-y', `${(py * 100).toFixed(2)}%`);
        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--pull-x', `${pullX.toFixed(2)}px`);
        card.style.setProperty('--pull-y', `${pullY.toFixed(2)}px`);
        card.classList.add('card-nearby');
      });

      card.addEventListener('mouseleave', () => {
        const state = cardStates.get(card);
        state.hovered = false;
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--spot-x', '50%');
        card.style.setProperty('--spot-y', '50%');
      });
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
          const pullX = Math.max(-maxPull, Math.min(maxPull, normX * maxPull * influence));
          const pullY = Math.max(-maxPull, Math.min(maxPull, normY * maxPull * influence));

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
        card.classList.remove('cursor-tilt-card');
        cardStates.delete(card);
      });
    };
  }, []);

  // Repel Effect: Card content pushes away from cursor
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const repelCards = document.querySelectorAll(
      '.about__box, .skills__data, .projects__card, .qualification__data, .contact__item'
    );

    const repelStates = new Map();
    const repelRange = 140;
    const maxRepel = 12;

    if (!repelCards || repelCards.length === 0) return;

    repelCards.forEach((card) => {
      card.classList.add('card-repel');
      repelStates.set(card, { isHovered: false });
    });

    const handleMouseMove = (event) => {
      repelCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance < repelRange) {
          const influence = 1 - distance / repelRange;
          const angle = Math.atan2(dy, dx);
          const repelDist = influence * maxRepel;
          const repelX = -Math.cos(angle) * repelDist;
          const repelY = -Math.sin(angle) * repelDist;

          card.style.setProperty('--repel-x', `${repelX.toFixed(2)}px`);
          card.style.setProperty('--repel-y', `${repelY.toFixed(2)}px`);
        } else {
          card.style.setProperty('--repel-x', '0px');
          card.style.setProperty('--repel-y', '0px');
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      repelCards.forEach((card) => {
        card.classList.remove('card-repel');
        repelStates.delete(card);
      });
    };
  }, []);

  // X-Ray Reveal: Flashlight effect reveals hidden info
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const xrayCards = document.querySelectorAll(
      '.about__box, .skills__data, .projects__card, .qualification__data, .contact__item'
    );

    const xrayData = {
      Experience: '7 years+',
      'Current Role': 'Manager-Design',
      Hobby: '📚 Knowledge',
      'Siemens NX (CAD)': 'Advanced',
      'Teamcenter Enterprise (PLM)': 'Advanced',
      'MATLAB': '3D Sims',
      'COMSOL': 'Thermal',
      'ANSYS': 'Stress',
      'Engine and Aggregates Development': '+50 Projects',
      'BSIII to BSIV and BSV Engine Transition': '+10 Variants',
      'Performance and System Optimization': '+25 Tests',
      'Standards and Emission Compliance Validation': '+60 Reports',
      'Address': '📍 Bihar',
      'Phone': '📞 Active',
      'Email': '📧 Available'
    };

    if (!xrayCards || xrayCards.length === 0) return;

    xrayCards.forEach((card) => {
      const titleEl = card.querySelector('h3');
      if (titleEl) {
        const title = titleEl.textContent.trim();
        const xrayValue = xrayData[title];
        
        if (xrayValue) {
          card.classList.add('card-xray');
          card.setAttribute('data-xray', xrayValue);
        }
      }
    });

    const handleMouseMove = (event) => {
      xrayCards.forEach((card) => {
        if (!card.classList.contains('card-xray')) return;

        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--xray-x', `${x.toFixed(2)}%`);
        card.style.setProperty('--xray-y', `${y.toFixed(2)}%`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      xrayCards.forEach((card) => {
        card.classList.remove('card-xray');
        card.removeAttribute('data-xray');
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
