
import React, { useEffect } from 'react';

const ScrollAnimator: React.FC = () => {
  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };

    const options = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(callback, options);

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ScrollAnimator;
