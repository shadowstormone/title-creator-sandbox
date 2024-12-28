import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

// Store the last registration attempt timestamp in localStorage
const REGISTRATION_COOLDOWN = 60000; // 1 minute in milliseconds
const STORAGE_KEY = 'lastRegistrationAttempt';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const canAttemptRegistration = () => {
    const lastAttempt = localStorage.getItem(STORAGE_KEY);
    if (!lastAttempt) return true;

    const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
    return timeSinceLastAttempt >= REGISTRATION_COOLDOWN;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAttemptRegistration()) {
      const remainingTime = Math.ceil((REGISTRATION_COOLDOWN - (Date.now() - parseInt(localStorage.getItem(STORAGE_KEY) || '0'))) / 1000);
      toast({
        title: "Пожалуйста, подождите",
        description: `Попробуйте снова через ${remainingTime} секунд`,
        variant: "destructive",
      });
      return;
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedUsername = username.trim();
    
    if (!isValidEmail(trimmedEmail)) {
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

    if (trimmedUsername.length < 3) {
      toast({
        title: "Ошибка",
        description: "Имя пользователя должно содержать минимум 3 символа",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
            role: "user",
          }
        }
      });

      if (error) {
        let errorMessage = "Не удалось зарегистрироваться";
        
        if (error.message.includes("email")) {
          errorMessage = "Email адрес недействителен или уже используется. Пожалуйста, используйте другой email.";
        } else if (error.message.includes("password")) {
          errorMessage = "Проблема с паролем. Убедитесь, что он содержит минимум 6 символов";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Слишком много попыток регистрации. Пожалуйста, подождите минуту и попробуйте снова.";
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        toast({
          title: "Успешная регистрация",
          description: "Пожалуйста, подтвердите ваш email адрес",
        });
        
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      toast({
        title: "Ошибка",
        description: error.message || "Произошла ошибка при регистрации",
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
          Регистрация
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Имя пользователя
              </label>
              <Input
                id="username"
                type="text"
                required
                className="mt-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

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
              <p className="mt-1 text-sm text-gray-400">
                Минимум 6 символов
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  Уже есть аккаунт? Войдите
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;