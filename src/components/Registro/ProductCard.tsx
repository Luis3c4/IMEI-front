import { ChevronRight } from "lucide-react";

interface ProductCardProps {
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

const ProductCard = ({ name, isSelected, onClick }: ProductCardProps) => (
  <button
    onClick={onClick}
    className={`group flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-[0.8125rem] font-medium transition-all duration-200 ${
      isSelected
        ? "glass-card border-primary/40 bg-accent text-accent-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_2px_8px_hsl(var(--glow)/0.1)]"
        : "glass-card glass-card-hover"
    }`}
  >
    <span className="truncate">{name}</span>
    <ChevronRight
      className={`ml-2 h-4 w-4 shrink-0 transition-all duration-200 ${
        isSelected
          ? "rotate-90 text-primary"
          : "text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground"
      }`}
    />
  </button>
);

export default ProductCard;
