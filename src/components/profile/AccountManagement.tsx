import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

const AccountManagement = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (error) throw error;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id as string);
      if (authError) throw authError;

      await logout();
      
      toast({
        title: "Аккаунт удален",
        description: "Ваш аккаунт был успешно удален",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аккаунт",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Управление аккаунтом</h3>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Удалить аккаунт</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Это действие нельзя отменить. Ваш аккаунт будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountManagement;