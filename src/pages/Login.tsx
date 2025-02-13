
import { AuthForm } from "@/components/AuthForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-neutral-50 p-4 flex items-center justify-center">
      <AuthForm initialMode="login" />
    </div>
  );
};

export default Login;
