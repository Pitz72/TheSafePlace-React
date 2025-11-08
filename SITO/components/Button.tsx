
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, href, variant = 'primary' }) => {
  const baseClasses = "inline-block px-8 py-4 text-lg transition-all duration-300 ease-in-out cursor-pointer text-glow";
  
  const variantClasses = {
    primary: "border-2 border-[#00ff41] text-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:bg-[#00ff41] hover:text-[#050a06] hover:shadow-[0_0_25px_rgba(0,255,65,0.8)]",
    secondary: "border-2 border-[#008f25] text-[#008f25] shadow-[0_0_10px_rgba(0,143,37,0.3)] hover:bg-[#008f25] hover:text-[#050a06] hover:shadow-[0_0_20px_rgba(0,143,37,0.8)]"
  };

  return (
    <a href={href} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </a>
  );
};

export default Button;
