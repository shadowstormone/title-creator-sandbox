import { Routes as RouterRoutes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Statistics from "./pages/Statistics";
import AnimeDetails from "./pages/AnimeDetails";
import AnimeEdit from "./pages/AnimeEdit";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Support from "./pages/Support";

const Routes = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster />
      <Sonner />
      <Navbar />
      <RouterRoutes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/statistics" element={<Statistics />} />
        <Route path="/anime/:id/:titleEn" element={<AnimeDetails />} />
        <Route path="/admin/anime/:id/:titleEn" element={<AnimeEdit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/support" element={<Support />} />
      </RouterRoutes>
    </div>
  );
};

export default Routes;