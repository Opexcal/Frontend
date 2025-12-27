import { Asterisk } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../../../public/OpexCal.svg";
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
    <Link to="/dashboard" className={`flex items-center gap-2 ${className}`}>
      <div className="text-primary">
        <img src={Image} alt="" className='w-10' />
      </div>
      {showText && (
        <span className={`font-display font-semibold text-primary ${textSizes[size]}`}>
          OpexCal
        </span>
      )}
    </Link>
  );
};
