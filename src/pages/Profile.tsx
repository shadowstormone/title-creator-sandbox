import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import AccountManagement from "@/components/profile/AccountManagement";
import { useAuth } from "@/hooks/auth/useAuth";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState(user?.username || "");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({ username });
      
      toast({
        title: "Профиль обновлен",
        description: "Изменения успешно сохранены",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-white">Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Профиль пользователя</h1>
        
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Изменить аватар
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Имя пользователя
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-gray-700 border-gray-600 text-white opacity-60"
            />
          </div>

          <Button type="submit" className="w-full">
            Сохранить изменения
          </Button>
        </form>

        <div className="mt-8">
          <AccountManagement />
        </div>
      </div>
    </div>
  );
};

export default Profile;