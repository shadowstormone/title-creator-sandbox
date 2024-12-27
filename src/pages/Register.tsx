import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (!isValidEmail(email)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректный email адрес",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    // Validate username
    if (username.length < 3) {
      toast({
        title: "Ошибка",
        description: "Имя пользователя должно содержать минимум 3 символа",
        variant: "destructive",
      });
      return;
    }

    try {
      await register(email, password, username);
      toast({
        title: "Успешная регистрация",
        description: "Добро пожаловать!",
      });
      navigate("/");
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = "Не удалось зарегистрироваться";
      
      if (error.message?.includes("email_address_invalid")) {
        errorMessage = "Некорректный email адрес";
      } else if (error.message?.includes("weak_password")) {
        errorMessage = "Пароль слишком простой. Используйте минимум 6 символов";
      } else if (error.message?.includes("already registered")) {
        errorMessage = "Этот email уже зарегистрирован";
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
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
                minLength={3}
                className="mt-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                minLength={6}
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-400">
                Минимум 6 символов
              </p>
            </div>

            <Button type="submit" className="w-full">
              Зарегистрироваться
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;