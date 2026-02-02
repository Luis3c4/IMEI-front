interface ColorDotProps {
  color: string;
  size?: "sm" | "md";
}

const ColorDot = ({ color, size = "md" }: ColorDotProps) => {
  const sizeClasses = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  
  return (
    <div
      className={`${sizeClasses} rounded-full border border-border/50 shadow-sm`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
};

export default ColorDot;
