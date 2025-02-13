
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                Split Expenses, Stay Friends
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
              <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary-dark">
                <Link to="/signup">Sign up for free</Link>
              </Button>
              <div className="ml-4">
                <Link to="/login" className="text-primary hover:text-primary-dark underline">
                  Already have an account?
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary">Simple</h3>
                <p className="text-neutral-600">Easy expense tracking</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary">Fair</h3>
                <p className="text-neutral-600">Split costs evenly</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary">Social</h3>
                <p className="text-neutral-600">Manage group expenses</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative"
          >
            <div className="relative w-full aspect-square">
              <img
                src="/lovable-uploads/b27b2dc4-95ee-4819-8c2d-9f097dcf919a.png"
                alt="Balance Buddies App Interface"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-50 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
