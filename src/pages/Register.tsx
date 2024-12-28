import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import RegistrationForm from "@/components/auth/RegistrationForm";

const Register = () => {
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    navigate("/login");
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
          <RegistrationForm onSuccess={handleRegistrationSuccess} />
          
          <div className="mt-4 text-sm">
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Уже есть аккаунт? Войдите
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;