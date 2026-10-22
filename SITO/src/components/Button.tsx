import React from 'react';
import Icon, { IconName } from './Icon';

interface ButtonProps {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
  /** Opens in a new tab, with an arrow after the text. */
  external?: boolean;
  icon?: IconName;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, href, variant = 'primary', external = false, icon, className = '' }) => {
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a href={href} className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`} {...externalProps}>
      {icon && <Icon name={icon} size={22} />}
      {children}
      {external && <Icon name="external" size={18} />}
    </a>
  );
};

export default Button;
