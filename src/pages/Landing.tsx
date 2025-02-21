import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, Heart } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col">
        {/* Background SVG */}
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
          <svg
            className="absolute w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1440 900"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#9b87f5", stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: "#b8a8f8", stopOpacity: 0.2 }} />
              </linearGradient>
            </defs>
            <path
              d="M0,900 C432,720 576,540 720,450 C864,360 1008,270 1440,180 L1440,900 L0,900 Z"
              fill="url(#gradient)"
            />
            <circle cx="1080" cy="225" r="144" fill="url(#gradient)" />
            <circle cx="360" cy="675" r="216" fill="url(#gradient)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 pt-32 relative flex-grow">
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="max-w-2xl mx-auto mt-12 space-y-8 text-neutral-600"
              >
                <div className="glass rounded-xl p-8 text-left">
                  <p className="mb-6">
                    This project is a no-code case study, created using 224 messages, 176 AI Edits and 4 human edits.
                  </p>
                  <p className="mb-4">The MVP scope is functional and allows you to:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>Sign up and Login</li>
                    <li>Manage your profile (Name, Email, Password)</li>
                    <li>Create groups</li>
                    <li>Invite group members</li>
                    <li>Record expenses in groups</li>
                    <li>Split expenses in groups equally, by percent or by amount</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="py-6 text-center text-neutral-600"
        >
          <p className="flex items-center justify-center gap-6">
            <a
              href="https://github.com/timohausmann/balance-buddies-split"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-primary transition-colors"
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </a>
            <a
              href="https://lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-primary transition-colors"
            >
              <Heart className="mr-2 h-5 w-5" />
              Made with Lovable
            </a>
          </p>
        </motion.footer>
      </div>
    </>
  );
};

export default Landing;
