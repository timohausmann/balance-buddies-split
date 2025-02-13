
import { Link } from "react-router-dom";

export const PublicHeader = () => {
  return (
    <header className="w-full border-b bg-white/50 backdrop-blur-sm fixed top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent"
          >
            Balance Buddies
          </Link>
        </div>
      </div>
    </header>
  );
};
