import React, { useEffect, useRef, useState } from 'react';

const Header = () => {
    const [activeSection, setActiveSection] = useState('home');
    const [navFx, setNavFx] = useState({
        scale: 1,
        opacity: 1,
        bgAlpha: 0.15,
        borderAlpha: 0.34,
        blur: 20
    });
    const headerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const shrinkProgress = Math.min(Math.max(scrollY / 320, 0), 1);

            setNavFx({
                scale: Number((1 - 0.12 * shrinkProgress).toFixed(3)),
                opacity: Number((1 - 0.32 * shrinkProgress).toFixed(3)),
                bgAlpha: Number((0.15 - 0.08 * shrinkProgress).toFixed(3)),
                borderAlpha: Number((0.34 - 0.14 * shrinkProgress).toFixed(3)),
                blur: Number((20 - 8 * shrinkProgress).toFixed(2))
            });
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    useEffect(() => {
        const sectionIds = ['home', 'about', 'skills', 'projects', 'qualification', 'contact'];

        const updateActiveSection = () => {
            const headerHeight = headerRef.current?.offsetHeight ?? 0;
            const checkpoint = window.scrollY + headerHeight + 90;

            let current = sectionIds[0];

            for (const id of sectionIds) {
                const section = document.getElementById(id);
                if (!section) continue;

                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;

                if (checkpoint >= top && checkpoint < bottom) {
                    current = id;
                    break;
                }

                if (checkpoint >= bottom) {
                    current = id;
                }
            }

            setActiveSection(current);
        };

        updateActiveSection();
        window.addEventListener('scroll', updateActiveSection, { passive: true });
        window.addEventListener('resize', updateActiveSection);

        return () => {
            window.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('resize', updateActiveSection);
        };
    }, []);

    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        const navList = header.querySelector('.nav__list');
        const navLinks = Array.from(header.querySelectorAll('.nav__link'));
        if (!navList || navLinks.length === 0) return;

        let hoverPill = navList.querySelector('.nav__hover-pill');
        if (!hoverPill) {
            hoverPill = document.createElement('span');
            hoverPill.className = 'nav__hover-pill';
            navList.appendChild(hoverPill);
        }

        const isDesktop = () => window.matchMedia('(min-width: 769px)').matches;

        const updatePill = (link) => {
            const listRect = navList.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            const x = linkRect.left - listRect.left;

            hoverPill.style.setProperty('--pill-x', `${x}px`);
            hoverPill.style.width = `${linkRect.width}px`;
            hoverPill.style.opacity = '1';
        };

        const hidePill = () => {
            hoverPill.style.opacity = '0';
        };

        const resetLinks = () => {
            navLinks.forEach((link) => {
                link.style.transform = 'translate3d(0,0,0)';
            });
        };

        const handleHeaderMove = (event) => {
            const rect = header.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            header.style.setProperty('--nav-x', `${x}%`);
            header.style.setProperty('--nav-y', `${y}%`);
            header.style.setProperty('--nav-glow', '1');
        };

        const handleHeaderLeave = () => {
            header.style.setProperty('--nav-glow', '0');
            resetLinks();
            hidePill();
        };

        const handlers = new Map();

        navLinks.forEach((link) => {
            const handleEnter = () => {
                if (isDesktop()) updatePill(link);
            };

            const handleMove = (event) => {
                if (!isDesktop()) return;

                const rect = link.getBoundingClientRect();
                const relX = event.clientX - rect.left;
                const relY = event.clientY - rect.top;

                const dx = (relX / rect.width - 0.5) * 10;
                const dy = (relY / rect.height - 0.5) * 10;

                link.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
            };

            const handleLeave = () => {
                link.style.transform = 'translate3d(0,0,0)';
            };

            link.addEventListener('mouseenter', handleEnter);
            link.addEventListener('mousemove', handleMove);
            link.addEventListener('mouseleave', handleLeave);
            link.addEventListener('focus', handleEnter);

            handlers.set(link, { handleEnter, handleMove, handleLeave });
        });

        const handleResize = () => {
            if (!isDesktop()) {
                hidePill();
                header.style.setProperty('--nav-glow', '0');
                resetLinks();
            }
        };

        navList.addEventListener('mouseleave', hidePill);
        header.addEventListener('mousemove', handleHeaderMove);
        header.addEventListener('mouseleave', handleHeaderLeave);
        window.addEventListener('resize', handleResize);

        return () => {
            navList.removeEventListener('mouseleave', hidePill);
            header.removeEventListener('mousemove', handleHeaderMove);
            header.removeEventListener('mouseleave', handleHeaderLeave);
            window.removeEventListener('resize', handleResize);

            handlers.forEach((value, link) => {
                link.removeEventListener('mouseenter', value.handleEnter);
                link.removeEventListener('mousemove', value.handleMove);
                link.removeEventListener('mouseleave', value.handleLeave);
                link.removeEventListener('focus', value.handleEnter);
            });
        };
    }, []);

  return (
    <header
        ref={headerRef}
        className="header floating-pill"
        id="header"
        style={{
            '--header-scale': navFx.scale,
            '--header-opacity': navFx.opacity,
            '--header-bg-alpha': navFx.bgAlpha,
            '--header-border-alpha': navFx.borderAlpha,
            '--header-blur': `${navFx.blur}px`
        }}
    >
        <nav className="nav container">
            <a href="#" className="nav__logo">Rohit Kumar</a>

            <div className="nav__menu" id="nav-menu">
                <ul className="nav__list">
                    <li className="nav__item"><a href="#home" className={`nav__link ${activeSection === 'home' ? 'active-link' : ''}`}>Home</a></li>
                    <li className="nav__item"><a href="#about" className={`nav__link ${activeSection === 'about' ? 'active-link' : ''}`}>About</a></li>
                    <li className="nav__item"><a href="#skills" className={`nav__link ${activeSection === 'skills' ? 'active-link' : ''}`}>Skills</a></li>
                    <li className="nav__item"><a href="#projects" className={`nav__link ${activeSection === 'projects' ? 'active-link' : ''}`}>Projects</a></li>
                    <li className="nav__item"><a href="#qualification" className={`nav__link ${activeSection === 'qualification' ? 'active-link' : ''}`}>Qualification</a></li>
                    <li className="nav__item"><a href="#contact" className={`nav__link ${activeSection === 'contact' ? 'active-link' : ''}`}>Contact</a></li>
                    <li className="nav__item"><a href="assets/resume.pdf" target="_blank" rel="noopener noreferrer" className="nav__link nav__link--resume">Resume <i className='bx bx-download'></i></a></li>
                </ul>
            </div>
        </nav>
    </header>
  );
};

export default Header;
