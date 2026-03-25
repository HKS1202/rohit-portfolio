import React from 'react';

const Skills = () => {
  return (
    <section className="skills section" id="skills">
        <h2 className="section__title">Skills</h2>
        <span className="section__subtitle">My technical level</span>

        <div className="skills__container container grid">
            
            {/* CAD and PLM */}
            <div className="skills__content">
                <h3 className="skills__title">CAD and PLM</h3>
                <div className="skills__box">
                    <div className="skills__group">
                        <div className="skills__data">
                            <i className='bx bx-cube'></i>
                            <div>
                                <h3 className="skills__name">Siemens NX (CAD)</h3>
                                <span className="skills__level">Advanced</span>
                            </div>
                        </div>
                        <div className="skills__data">
                            <i className='bx bx-data'></i>
                            <div>
                                <h3 className="skills__name">Teamcenter Enterprise (PLM)</h3>
                                <span className="skills__level">Advanced</span>
                            </div>
                        </div>
                        <div className="skills__data">
                            <i className='bx bx-git-branch'></i>
                            <div>
                                <h3 className="skills__name">Teamcenter Unified Architecture (PLM)</h3>
                                <span className="skills__level">Intermediate</span>
                            </div>
                        </div>
                    </div>
                    <div className="skills__group">
                        <div className="skills__data">
                            <i className='bx bx-file'></i>
                            <div>
                                <h3 className="skills__name">MS Office</h3>
                                <span className="skills__level">Intermediate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation and Analysis */}
            <div className="skills__content">
                <h3 className="skills__title">Simulation and Analysis</h3>
                <div className="skills__box">
                    <div className="skills__group">
                        <div className="skills__data">
                            <i className='bx bx-line-chart'></i>
                            <div>
                                <h3 className="skills__name">MATLAB</h3>
                                <span className="skills__level">Intermediate</span>
                            </div>
                        </div>
                        <div className="skills__data">
                            <i className='bx bx-shape-circle'></i>
                            <div>
                                <h3 className="skills__name">COMSOL</h3>
                                <span className="skills__level">Intermediate</span>
                            </div>
                        </div>
                        <div className="skills__data">
                            <i className='bx bx-cog'></i>
                            <div>
                                <h3 className="skills__name">ANSYS</h3>
                                <span className="skills__level">Intermediate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Domain Knowledge */}
            <div className="skills__content dsa-content">
                <h3 className="skills__title">Domain Expertise</h3>
                <div className="skills__box">
                    <div className="skills__group" style={{ alignItems: 'center', justifyItems: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="skills__data">
                            <i className='bx bx-wrench'></i>
                            <div>
                                <h3 className="skills__name">Engine and Aggregates Design</h3>
                                <span className="skills__level">Advanced</span>
                            </div>
                        </div>
                        <div className="skills__data">
                            <i className='bx bx-check-shield'></i>
                            <div>
                                <h3 className="skills__name">Emission Norm Compliance (BS, EPA, CARB, EU)</h3>
                                <span className="skills__level">Advanced</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>
  );
};

export default Skills;
