import { Asterisk } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ size = "md", showText = true, className = "" }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="text-primary">
        <Asterisk className={sizeClasses[size]} strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`font-display font-semibold text-primary ${textSizes[size]}`}>
          OpexCal
        </span>
      )}
    </Link>
  );
};
