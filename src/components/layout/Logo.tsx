
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link 
      to="/dashboard" 
      className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent"
    >
      Balance Buddies
    </Link>
  );
};
