
import { Logo } from "./Logo";

export const PublicHeader = () => {
  return (
    <header className="w-full border-b bg-white/50 backdrop-blur-sm fixed top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center">
          <Logo href="/" />
        </div>
      </div>
    </header>
  );
};
