import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase().trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.toLowerCase().trim();
    
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

    if (username.length < 3) {
      toast({
        title: "Ошибка",
        description: "Имя пользователя должно содержать минимум 3 символа",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username,
            role: "user",
          }
        }
      });

      if (error) {
        let errorMessage = "Не удалось зарегистрироваться";
        
        if (error.message.includes("email")) {
          errorMessage = "Некорректный формат email адреса или email уже используется";
        } else if (error.message.includes("password")) {
          errorMessage = "Проблема с паролем. Убедитесь, что он содержит минимум 6 символов";
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