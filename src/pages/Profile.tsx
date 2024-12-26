import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // В реальном приложении здесь должна быть загрузка файла на сервер
      const imageUrl = URL.createObjectURL(file);
      updateProfile({ avatarUrl: imageUrl });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold">Необходимо войти в аккаунт</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Профиль пользователя</h2>
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("avatar-upload")?.click()}
              >
                Изменить аватар
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Имя пользователя
              </label>
              <div className="mt-1 text-lg">{user.username}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1 text-lg">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Роль
              </label>
              <div className="mt-1 text-lg capitalize">{user.role}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Дата регистрации
              </label>
              <div className="mt-1 text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;