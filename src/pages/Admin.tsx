import { useState } from "react";
import { Link } from "react-router-dom";
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

  const handleAnimeSubmit = (data: any) => {
    toast({
      title: "Аниме добавлено",
      description: "Новое аниме успешно добавлено в базу данных",
    });
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-purple-400">Админ панель</h1>
        
        {/* Форма добавления нового аниме */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Добавить новое аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimeForm onSubmit={handleAnimeSubmit} />
          </CardContent>
        </Card>

        {/* Список аниме */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Список аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Серии</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAnimeList.map((anime) => (
                  <TableRow key={anime.id}>
                    <TableCell>{anime.id}</TableCell>
                    <TableCell>{anime.title}</TableCell>
                    <TableCell>{anime.uploadedEpisodes} из {anime.totalEpisodes}</TableCell>
                    <TableCell>
                      <Link to={`/admin/anime/${anime.id}-${anime.titleEn}`}>
                        <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600">
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