import React, { useState, useEffect } from 'react';

const ScrollUp = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 560) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 560) {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  return (
    <a href="#" className={`scrollup ${showScroll ? 'show-scroll' : ''}`} id="scroll-up">
        <i className='bx bx-up-arrow-alt scrollup__icon'></i>
    </a>
  );
};

export default ScrollUp;
