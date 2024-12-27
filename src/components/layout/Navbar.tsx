import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  const canAccessAdmin = user && ["creator", "admin"].includes(user.role);

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/logo.png"
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
            {user ? (
              <>
                {canAccessAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="mr-4">
                      Админ панель
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="outline" className="mr-4">
                    Профиль
                  </Button>
                </Link>
                <Button variant="ghost" onClick={logout}>
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