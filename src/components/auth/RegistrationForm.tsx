import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { 
  isValidEmail, 
  canAttemptRegistration, 
  setRegistrationAttempt,
  getRemainingCooldownTime 
} from "@/utils/registrationUtils";

interface RegistrationFormProps {
  onSuccess: () => void;
}

const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAttemptRegistration()) {
      const remainingTime = getRemainingCooldownTime();
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
    setRegistrationAttempt();

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
          errorMessage = "Email адрес недействителен или уже используется";
        } else if (error.message.includes("password")) {
          errorMessage = "Проблема с паролем. Убедитесь, что он содержит минимум 6 символов";
        } else if (error.message.includes("rate limit") || error.status === 429) {
          errorMessage = "Превышен лимит попыток регистрации. Пожалуйста, подождите 5 минут и попробуйте снова.";
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        toast({
          title: "Успешная регистрация",
          description: "Пожалуйста, подтвердите ваш email адрес",
        });
        
        onSuccess();
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
    </form>
  );
};

export default RegistrationForm;