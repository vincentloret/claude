type IconProps = {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function Icon({ name, size = 22, filled = false, className, style }: IconProps) {
  return (
    <span
      className={`msym ${filled ? "msym-fill" : ""} ${className ?? ""}`}
      style={{ fontSize: size, ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
