import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    setShowVerificationAlert(false);
    
    if (!validateEmail(email)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректный email адрес",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать!",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = error.message || "Не удалось войти в систему";
      
      if (errorMessage.includes("Email не подтвержден")) {
        setShowVerificationAlert(true);
        errorMessage = "Пожалуйста, подтвердите ваш email адрес. Проверьте вашу почту.";
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Вход в аккаунт
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showVerificationAlert && (
            <Alert className="mb-6">
              <AlertDescription>
                Ваш email адрес не подтвержден. Пожалуйста, проверьте вашу почту и перейдите по ссылке для подтверждения. 
                Если вы не получили письмо, проверьте папку "Спам".
              </AlertDescription>
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                required
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/register" className="text-blue-400 hover:text-blue-300">
                  Нет аккаунта? Зарегистрируйтесь
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;