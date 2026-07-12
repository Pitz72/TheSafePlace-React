import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
  external?: boolean;
  download?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, href, variant = 'primary', external = false, download = false }) => {
  const baseClasses = "inline-block px-8 py-4 text-lg transition-all duration-300 ease-in-out cursor-pointer text-glow";

  const variantClasses = {
    primary: "border-2 border-[#33ff33] text-[#33ff33] shadow-[0_0_15px_rgba(51,255,51,0.3)] hover:bg-[#33ff33] hover:text-[#050a05] hover:shadow-[0_0_25px_rgba(51,255,51,0.8)]",
    secondary: "border-2 border-[#28cc28] text-[#28cc28] shadow-[0_0_10px_rgba(40,204,40,0.3)] hover:bg-[#28cc28] hover:text-[#050a05] hover:shadow-[0_0_20px_rgba(40,204,40,0.8)]"
  };

  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a href={href} className={`${baseClasses} ${variantClasses[variant]}`} {...externalProps} {...(download ? { download: '' } : {})}>
      {children}
    </a>
  );
};

export default Button;
