import { ChevronRight, ChevronDown } from "lucide-react";

interface ExpandButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

const ExpandButton = ({ isExpanded, onClick }: ExpandButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="p-1 hover:bg-accent rounded transition-colors"
    >
      {isExpanded ? (
        <ChevronDown className="w-5 h-5 text-foreground" />
      ) : (
        <ChevronRight className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
};

export default ExpandButton;
