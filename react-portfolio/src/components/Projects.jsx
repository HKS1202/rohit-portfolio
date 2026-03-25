import React from 'react';

const Projects = () => {
  return (
    <section className="projects section" id="projects">
        <h2 className="section__title">Key Work Areas</h2>
        
        <div className="projects__container container grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {/* Project 1 */}
            <div className="projects__card">
                <i className='bx bx-cog projects__icon'></i>
                <h3 className="projects__title">Engine and Aggregates<br/>Development</h3>
                <a href="#qualification" className="projects__button">
                    View Details <i className='bx bx-right-arrow-alt projects__button-icon'></i>
                </a>
            </div>

            {/* Project 2 */}
            <div className="projects__card">
                <i className='bx bx-transfer-alt projects__icon'></i>
                <h3 className="projects__title">BSIII to BSIV and BSV<br/>Engine Transition</h3>
                <a href="#qualification" className="projects__button">
                    View Details <i className='bx bx-right-arrow-alt projects__button-icon'></i>
                </a>
            </div>

            {/* Project 3 */}
            <div className="projects__card">
                <i className='bx bx-trending-up projects__icon'></i>
                <h3 className="projects__title">Performance and System<br/>Optimization</h3>
                <a href="#qualification" className="projects__button">
                    View Details <i className='bx bx-right-arrow-alt projects__button-icon'></i>
                </a>
            </div>

            {/* Project 4 */}
            <div className="projects__card">
                <i className='bx bx-check-circle projects__icon'></i>
                <h3 className="projects__title">Standards and Emission<br/>Compliance Validation</h3>
                <a href="#qualification" className="projects__button">
                    View Details <i className='bx bx-right-arrow-alt projects__button-icon'></i>
                </a>
            </div>
        </div>
    </section>
  );
};

export default Projects;
