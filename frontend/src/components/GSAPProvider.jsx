import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const GSAPProvider = ({ children }) => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  return <>{children}</>;
};

export default GSAPProvider;
