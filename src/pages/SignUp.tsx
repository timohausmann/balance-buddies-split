
import { AuthForm } from "@/components/AuthForm";

const SignUp = () => {
  return (
    <div className="min-h-screen bg-neutral-50 p-4 flex items-center justify-center">
      <AuthForm initialMode="signup" />
    </div>
  );
};

export default SignUp;
