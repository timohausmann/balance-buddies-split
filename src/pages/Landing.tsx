
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  return (
    <>
      <PublicHeader session={session} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        {/* Background SVG */}
        <div className="absolute inset-0 w-full overflow-hidden pointer-events-none">
          <svg
            className="absolute w-screen h-full opacity-50"
            viewBox="0 0 1000 1000"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#9b87f5", stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: "#b8a8f8", stopOpacity: 0.2 }} />
              </linearGradient>
            </defs>
            <path
              d="M0,1000 C300,800 400,600 500,500 C600,400 700,300 1000,200 L1000,1000 L0,1000 Z"
              fill="url(#gradient)"
            />
            <circle cx="750" cy="250" r="100" fill="url(#gradient)" />
            <circle cx="250" cy="750" r="150" fill="url(#gradient)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 pt-32 relative">
          <div className="grid grid-cols-1 gap-12">
            <div className="space-y-8 max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                  Easily balance your expenses with friends
                </h1>
                <p className="mt-6 text-xl text-neutral-600">
                  Balance Buddies makes group expense tracking simple and stress-free. Perfect for roommates, trips, and shared expenses.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4"
              >
                {session ? (
                  <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary-dark">
                    <Link to="/dashboard">Go to app</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary-dark">
                      <Link to="/signup">Sign up for free</Link>
                    </Button>
                    <div className="mt-4">
                      <Link to="/login" className="text-primary hover:text-primary-dark underline">
                        Already have an account?
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
              >
                <div className="text-center p-6 glass rounded-xl">
                  <h3 className="text-2xl font-bold text-primary">Simple</h3>
                  <p className="text-neutral-600">Easy expense tracking</p>
                </div>
                <div className="text-center p-6 glass rounded-xl">
                  <h3 className="text-2xl font-bold text-primary">Fair</h3>
                  <p className="text-neutral-600">Split costs evenly</p>
                </div>
                <div className="text-center p-6 glass rounded-xl">
                  <h3 className="text-2xl font-bold text-primary">Social</h3>
                  <p className="text-neutral-600">Manage group expenses</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
