import React from 'react';
import profilePhoto from '../assets/roht.jpeg';

const About = () => {
  return (
    <section className="about section" id="about">
        <h2 className="section__title">About Me</h2>
        <span className="section__subtitle">My Introduction</span>

        <div className="about__container container grid">
            <div className="about__img-wrapper">
                <span className="about__ripple about__ripple--1" aria-hidden="true"></span>
                <span className="about__ripple about__ripple--2" aria-hidden="true"></span>
                <span className="about__ripple about__ripple--3" aria-hidden="true"></span>
                <img
                    src={profilePhoto}
                    alt="Rohit Kumar"
                    className="about__img"
                />
            </div>

            <div className="about__data">
                <div className="about__info grid">
                    <div className="about__box tilt-card">
                        <i className='bx bx-award about__icon'></i>
                        <h3 className="about__title">Experience</h3>
                        <span className="about__subtitle">July 2022 - Present</span>
                    </div>
                    <div className="about__box tilt-card">
                        <i className='bx bx-briefcase-alt about__icon'></i>
                        <h3 className="about__title">Current Role</h3>
                        <span className="about__subtitle">Design Engineer - Engine and Aggregates</span>
                    </div>
                    <div className="about__box tilt-card">
                        <i className='bx bx-support about__icon'></i>
                        <h3 className="about__title">Hobby</h3>
                        <span className="about__subtitle">Reading newspaper</span>
                    </div>
                </div>

                <p className="about__description">
                    I am Rohit Kumar, currently working at Tata Hitachi Construction Machinery Company Pvt. Ltd.,
                    Dharwad, as Manager-Design. I handle engine and aggregates development for excavators and backhoe
                    loaders, including NPI, optimization, VAVE, and BSIII to BSIV/BSV emission transitions aligned
                    with CEV requirements for domestic and export machines.
                </p>

                <a href="assets/resume.pdf" target="_blank" rel="noopener noreferrer" className="button">
                  View Resume <i className='bx bx-file-blank'></i>
                </a>
            </div>
        </div>
    </section>
  );
};

export default About;
