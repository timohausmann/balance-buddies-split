
import { Link } from "react-router-dom";

interface LogoProps {
  href: string;
}

export const Logo = ({ href }: LogoProps) => {
  return (
    <Link 
      to={href}
      className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent"
    >
      Balance Buddies
    </Link>
  );
};
