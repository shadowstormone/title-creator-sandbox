import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { session, logout } = useAuth();
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!session?.user) {
        setCanAccessAdmin(false);
        return;
      }

      try {
        const { data: userMetadata } = await supabase.auth.admin.getUserById(session.user.id);
        setCanAccessAdmin(
          userMetadata?.user?.user_metadata?.role === 'admin' || 
          userMetadata?.user?.user_metadata?.role === 'creator'
        );
      } catch (error) {
        console.error("Error checking admin access:", error);
        setCanAccessAdmin(false);
      }
    };

    checkAdminAccess();
  }, [session]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при выходе",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/placeholder.svg"
                alt="Anime Portal"
              />
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Главная
              </Link>
              <Link
                to="/support"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Поддержать проект
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {session ? (
              <>
                {canAccessAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="mr-4">
                      Админ панель
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="mr-4">
                    Войти
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default">
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;