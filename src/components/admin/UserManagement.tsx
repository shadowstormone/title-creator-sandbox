
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { UserRole } from "@/lib/types";
import { Search, Ban, UserX, CheckCircle } from "lucide-react";

const roles: { value: UserRole; label: string }[] = [
  { value: "creator", label: "Создатель" },
  { value: "admin", label: "Админ" },
  { value: "moderator", label: "Модератор" },
  { value: "technician", label: "Технарь" },
  { value: "dubber", label: "Даббер" },
  { value: "vip", label: "VIP" },
  { value: "subscriber", label: "Подписчик" },
  { value: "user", label: "Пользователь" },
];

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось загрузить список пользователей: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Роль пользователя обновлена",
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось обновить роль пользователя: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const banUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Пользователь заблокирован",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось заблокировать пользователя: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Пользователь разблокирован",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось разблокировать пользователя: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Пользователь деактивирован",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось деактивировать пользователя: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: true,
          deactivated_at: null
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Пользователь активирован",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error activating user:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось активировать пользователя: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-purple-400">Управление пользователями</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск пользователей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-gray-700 text-white border-gray-600"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Имя</TableHead>
              <TableHead className="text-gray-300">Статус</TableHead>
              <TableHead className="text-gray-300">Роль</TableHead>
              <TableHead className="text-gray-300">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-gray-700">
                <TableCell className="text-white">{user.email}</TableCell>
                <TableCell className="text-white">{user.username || 'Нет имени'}</TableCell>
                <TableCell className="text-white">
                  {user.is_banned ? (
                    <span className="text-red-500">Заблокирован</span>
                  ) : !user.is_active ? (
                    <span className="text-yellow-500">Деактивирован</span>
                  ) : (
                    <span className="text-green-500">Активен</span>
                  )}
                </TableCell>
                <TableCell className="text-white">
                  <Select
                    value={user.role || 'user'}
                    onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value} className="text-white hover:bg-gray-600">
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="space-x-2 flex">
                  {user.is_banned ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-green-600 hover:bg-green-700 mr-2">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Разблокировать пользователя?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Пользователь снова сможет войти в свой аккаунт.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => unbanUser(user.id)}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            Разблокировать
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-yellow-600 hover:bg-yellow-700 mr-2">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Заблокировать пользователя?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Пользователь не сможет войти в свой аккаунт.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => banUser(user.id)}
                            className="bg-yellow-600 text-white hover:bg-yellow-700"
                          >
                            Заблокировать
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {user.is_active ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-red-600 hover:bg-red-700">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Деактивировать пользователя?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Профиль пользователя будет деактивирован. Это действие можно отменить позже.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deactivateUser(user.id)}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Деактивировать
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Активировать пользователя?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Профиль пользователя будет активирован.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => activateUser(user.id)}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            Активировать
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
