import React from 'react';
import profilePhoto from '../assets/roht.jpeg';

const Home = () => {
  return (
    <section className="home section" id="home">
        <div className="home__container container grid">
            <div className="home__content grid">
                <div className="home__social">
                    <a
                        href="mailto:rohithimanshu08@gmail.com"
                        className="home__social-icon"
                        data-tooltip="rohithimanshu08@gmail.com"
                        aria-label="Email Rohit"
                        style={{ '--delay': '0.1s', '--float-duration': '3.7s' }}
                    >
                        <i className='bx bx-envelope'></i>
                    </a>
                    <a
                        href="tel:+916202095002"
                        className="home__social-icon"
                        data-tooltip="+91 62029 50002"
                        aria-label="Call Rohit"
                        style={{ '--delay': '0.25s', '--float-duration': '4.3s' }}
                    >
                        <i className='bx bx-phone'></i>
                    </a>
                    <a
                        href="#contact"
                        className="home__social-icon"
                        data-tooltip="Instagram"
                        aria-label="Instagram"
                        style={{ '--delay': '0.4s', '--float-duration': '4.9s' }}
                    >
                        <i className='bx bxl-instagram'></i>
                    </a>
                </div>

                <div className="home__data" style={{ position: 'relative', zIndex: 10 }}>
                    <h1 className="home__title name-sunrise typewriter-name">
                        <span className="type-line type-line--one" data-text="Rohit">Rohit</span>
                        <br />
                        <span className="type-line type-line--two" data-text="Kumar">Kumar</span>
                        <span className="hand">👋</span>
                    </h1>
                    <h3 className="home__subtitle text-light">Manager-Design | Engine and Aggregates</h3>
                    <p className="home__description text-light">
                        An enthusiastic professional with design and development experience in heavy construction
                        machinery, seeking challenging opportunities where academic knowledge, technical skills,
                        and industrial experience can be utilized efficiently.
                    </p>
                    <a href="#contact" className="button">Say Hi <i className='bx bx-send'></i></a>

                    <div className="home__scroll">
                        <a href="#about" className="home__scroll-button">
                            <i className='bx bx-mouse home__scroll-mouse text-light'></i>
                            <span className="home__scroll-name text-light">Scroll Down &darr;</span>
                        </a>
                    </div>
                </div>

                <div className="home__img-wrapper">
                    <span className="home__ripple home__ripple--1" aria-hidden="true"></span>
                    <span className="home__ripple home__ripple--2" aria-hidden="true"></span>
                    <span className="home__ripple home__ripple--3" aria-hidden="true"></span>
                    <div className="home__img">
                        <img src={profilePhoto} alt="Rohit's Photo" />
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Home;
