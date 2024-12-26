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

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState(mockAnimeList);
  
  const handleAnimeSubmit = (data: any) => {
    // Создаем новый ID (в реальном приложении это будет делать бэкенд)
    const newId = animeList.length + 1;
    
    // Создаем новый объект аниме
    const newAnime = {
      id: newId,
      title: data.title,
      titleEn: data.titleEn,
      totalEpisodes: parseInt(data.totalEpisodes),
      uploadedEpisodes: parseInt(data.uploadedEpisodes)
    };
    
    // Добавляем новое аниме в список
    setAnimeList(prev => [...prev, newAnime]);
    
    toast({
      title: "Аниме добавлено",
      description: "Новое аниме успешно добавлено в базу данных",
    });
    
    // Перенаправляем на главную страницу
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
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
                {animeList.map((anime) => (
                  <TableRow key={anime.id} className="border-gray-700">
                    <TableCell className="text-white">{anime.id}</TableCell>
                    <TableCell className="text-white">{anime.title}</TableCell>
                    <TableCell className="text-white">
                      {anime.uploadedEpisodes} из {anime.totalEpisodes}
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/anime/${anime.id}/${anime.titleEn}`}>
                        <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
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