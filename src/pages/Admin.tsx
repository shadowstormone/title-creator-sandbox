import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AnimeForm from "@/components/admin/AnimeForm";

// Временные данные (в будущем будут загружаться из базы данных)
const mockAnimeList = [
  { 
    id: 1, 
    title: "Наруто", 
    titleEn: "naruto",
    totalEpisodes: 220,
    uploadedEpisodes: 210
  },
  { 
    id: 2, 
    title: "Блич", 
    titleEn: "bleach",
    totalEpisodes: 366,
    uploadedEpisodes: 366
  },
];

const isAdmin = () => {
  const token = localStorage.getItem('adminToken');
  return token === 'your-secure-admin-token'; // В реальном приложении используйте настоящую проверку токена
};

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAdmin()) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав для доступа к админ-панели",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [navigate, toast]);

  const handleAnimeSubmit = (data: any) => {
    toast({
      title: "Аниме добавлено",
      description: "Новое аниме успешно добавлено в базу данных",
    });
    console.log(data);
  };

  if (!isAdmin()) {
    return null; // Предотвращаем рендер контента для неавторизованных пользователей
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-purple-400">Админ панель</h1>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Добавить новое аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimeForm onSubmit={handleAnimeSubmit} />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Список аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">ID</TableHead>
                  <TableHead className="text-gray-300">Название</TableHead>
                  <TableHead className="text-gray-300">Серии</TableHead>
                  <TableHead className="text-gray-300">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAnimeList.map((anime) => (
                  <TableRow key={anime.id} className="border-gray-700">
                    <TableCell className="text-gray-300">{anime.id}</TableCell>
                    <TableCell className="text-gray-300">{anime.title}</TableCell>
                    <TableCell className="text-gray-300">{anime.uploadedEpisodes} из {anime.totalEpisodes}</TableCell>
                    <TableCell>
                      <Link to={`/admin/anime/${anime.id}-${anime.titleEn}`}>
                        <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-gray-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
