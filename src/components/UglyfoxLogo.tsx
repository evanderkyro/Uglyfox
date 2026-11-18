interface UglyfoxLogoProps {
  size?: number;
  className?: string;
}

export function UglyfoxLogo({ size = 36, className = '' }: UglyfoxLogoProps) {
  return (
    <img
      src="/favicon.svg"
      alt="Uglyfox"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className={`shrink-0 block select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
