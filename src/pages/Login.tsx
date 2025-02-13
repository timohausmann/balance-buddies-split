
import { AuthForm } from "@/components/AuthForm";
import { PublicHeader } from "@/components/layout/PublicHeader";

const Login = () => {
  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-neutral-50 p-4 flex items-center justify-center">
        <AuthForm initialMode="login" />
      </div>
    </>
  );
};

export default Login;
