import React, { useState } from 'react';

const Qualification = () => {
  const [activeTab, setActiveTab] = useState('education');

  return (
    <section className="qualification section" id="qualification">
        <h2 className="section__title">Qualification</h2>
        <span className="section__subtitle">My Personal Journey</span>

        <div className="qualification__container container">
            <div className="qualification__tabs">
                <div 
                    className={`qualification__button ${activeTab === 'education' ? 'qualification__active' : ''}`}
                    onClick={() => setActiveTab('education')}
                >
                    <i className='bx bxs-graduation qualification__icon'></i> Education
                </div>
                <div 
                    className={`qualification__button ${activeTab === 'experience' ? 'qualification__active' : ''}`}
                    onClick={() => setActiveTab('experience')}
                >
                    <i className='bx bx-briefcase-alt qualification__icon'></i> Experience
                </div>
            </div>

            <div className="qualification__sections">
                {activeTab === 'education' && (
                <div className="qualification__content qualification__active" id="education">
                    
                    {/* Qual 1 */}
                    <div className="qualification__data">
                        <div>
                            <h3 className="qualification__title">M.Tech - Machine Design</h3>
                            <span className="qualification__subtitle">National Institute of Technology, Durgapur</span>
                            <div className="qualification__calendar">
                                <i className='bx bx-calendar'></i> 2022 | CGPA: 8.67
                            </div>
                        </div>
                        <div>
                            <span className="qualification__rounder"></span>
                            <span className="qualification__line"></span>
                        </div>
                    </div>
                    
                    {/* Qual 2 */}
                    <div className="qualification__data">
                        <div></div>
                        <div>
                            <span className="qualification__rounder"></span>
                            <span className="qualification__line"></span>
                        </div>
                        <div>
                            <h3 className="qualification__title">B.Tech - Mechanical Engineering</h3>
                            <span className="qualification__subtitle">C.V. Raman Global University, Odisha</span>
                            <div className="qualification__calendar">
                                <i className='bx bx-calendar'></i> 2020 | CGPA: 8.25
                            </div>
                        </div>
                    </div>

                    {/* Qual 3 */}
                    <div className="qualification__data">
                        <div>
                            <h3 className="qualification__title">12th Science (Mathematics)</h3>
                            <span className="qualification__subtitle">BSEB, Patna</span>
                            <div className="qualification__calendar">
                                <i className='bx bx-calendar'></i> 2015 | 68.4%
                            </div>
                        </div>
                        <div>
                            <span className="qualification__rounder"></span>
                            <span className="qualification__line"></span>
                        </div>
                    </div>

                    {/* Qual 4 */}
                    <div className="qualification__data">
                        <div></div>
                        <div>
                            <span className="qualification__rounder"></span>
                        </div>
                        <div>
                            <h3 className="qualification__title">10th</h3>
                            <span className="qualification__subtitle">BSEB, Patna</span>
                            <div className="qualification__calendar">
                                <i className='bx bx-calendar'></i> 2013 | 73%
                            </div>
                        </div>
                    </div>

                </div>
                )}

                {activeTab === 'experience' && (
                <div className="qualification__content qualification__active" id="experience">
                    <div className="qualification__data">
                        <div>
                            <h3 className="qualification__title">Design Engineer - Engine (Diesel) and Aggregates</h3>
                            <span className="qualification__subtitle">Tata Hitachi Construction Machinery Company Pvt. Ltd., Dharwad, Karnataka</span>
                            <div className="qualification__calendar">
                                <i className='bx bx-calendar'></i> April 1, 2024 - Present
                            </div>
                            <span className="qualification__subtitle">
                                Responsible for engine and aggregates (engine mounts, ROC, air cleaner, silencer) for excavators and backhoe loaders, including database management, NPI, optimization, and VAVE.
                            </span>
                            <span className="qualification__subtitle">
                                Worked on engine performance curve optimization, ROC heat load, air intake airflow requirements, vibration transmissibility, and cross-functional implementation.
                            </span>
                            <span className="qualification__subtitle">
                                Led BSIII to BSIV and BSV engine transitions with turbocharger, DOC, DPF, and EGR integration to meet CEV and export emission norms.
                            </span>
                        </div>
                        <div>
                            <span className="qualification__rounder"></span>
                            <span className="qualification__line"></span>
                        </div>
                    </div>

                    <div className="qualification__data">
                        <div></div>
                        <div>
                            <span className="qualification__rounder"></span>
                        </div>
                        <div>
                            <h3 className="qualification__title">Design Engineer - Machine Integration (13 Ton Class Excavator)</h3>
                            <span className="qualification__subtitle">Tata Hitachi Construction Machinery Company Pvt. Ltd., Dharwad, Karnataka</span>
                            <div className="qualification__calendar">
                                <i className='bx bx-calendar'></i> July 1, 2022 - March 31, 2024
                            </div>
                            <span className="qualification__subtitle">
                                Worked in the design and development group for NPI of 13-ton class EX130 Prime excavator, covering material selection, modeling, layout, and design release.
                            </span>
                            <span className="qualification__subtitle">
                                Coordinated with verticals for issue analysis, literature review, countermeasures, parts development, prototype assembly, and testing.
                            </span>
                            <span className="qualification__subtitle">
                                Handled stress, heat balance, noise, and vibration test analysis and implemented effective countermeasures for NG/failure points.
                            </span>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    </section>
  );
};

export default Qualification;
