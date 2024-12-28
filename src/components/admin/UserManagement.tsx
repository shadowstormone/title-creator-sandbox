import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { UserRole } from "@/lib/types";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
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
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-purple-400">Управление пользователями</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Имя</TableHead>
              <TableHead className="text-gray-300">Роль</TableHead>
              <TableHead className="text-gray-300">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-gray-700">
                <TableCell className="text-white">{user.email}</TableCell>
                <TableCell className="text-white">{user.username || 'Нет имени'}</TableCell>
                <TableCell className="text-white">{user.role || 'user'}</TableCell>
                <TableCell>
                  <Select
                    value={user.role || 'user'}
                    onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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