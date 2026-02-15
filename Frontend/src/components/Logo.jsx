import React from 'react';
import LogoImage from '../Logo/Logo GPA Game.png';

export const Logo = ({ size = 32, className = '' }) => {
  return (
    <img
      src={LogoImage}
      alt="GPA GAME"
      width={size}
      height={size}
      className={`${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};
