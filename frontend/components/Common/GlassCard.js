import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true, 
  onClick, 
  gradient = false 
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-2xl
    backdrop-blur-md backdrop-saturate-150
    bg-white/10 border border-white/20
    shadow-xl shadow-black/20
    ${gradient ? 'bg-gradient-to-br from-white/15 to-white/5' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const CardComponent = motion.div;

  return (
    <CardComponent
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { 
        scale: 1.02,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        transition: { duration: 0.2 }
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Дополнительные эффекты стекла */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tl from-gray-900/10 via-transparent to-transparent" />
      
      {/* Контент */}
      <div className="relative z-10">
        {children}
      </div>
    </CardComponent>
  );
};

export default GlassCard;