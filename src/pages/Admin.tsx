import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AnimeForm from "@/components/admin/AnimeForm";
import { supabase } from "@/lib/supabaseClient";

// Временные данные (в будущем будут загружаться из базы данных)
const mockAnimeList = [
  { 
    id: 1, 
    title: "Наруто", 
    titleEn: "naruto",
    description: "Naruto description",
    genres: ["action", "adventure"],
    totalEpisodes: 220,
    uploadedEpisodes: 210,
    year: 2002,
    season: "Fall",
    studio: "Studio Pierrot",
    voiceActing: "Japanese",
    timing: "24 min per ep"
  },
  { 
    id: 2, 
    title: "Блич", 
    titleEn: "bleach",
    description: "Bleach description",
    genres: ["action", "supernatural"],
    totalEpisodes: 366,
    uploadedEpisodes: 366,
    year: 2004,
    season: "Fall",
    studio: "Studio Pierrot",
    voiceActing: "Japanese",
    timing: "24 min per ep"
  },
];

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if we have any anime in the database
        const { data: existingAnime, error: fetchError } = await supabase
          .from('animes')
          .select('*');

        if (fetchError) throw fetchError;

        if (!existingAnime || existingAnime.length === 0) {
          // If no anime exists, insert the mock data
          console.log('No anime found, inserting mock data...');
          const { error: insertError } = await supabase
            .from('animes')
            .insert(mockAnimeList.map(({ id, ...rest }) => rest)); // Remove id as it's auto-generated

          if (insertError) throw insertError;
          
          toast({
            title: "База данных инициализирована",
            description: "Тестовые данные успешно добавлены",
          });
        }

        // Fetch the current data
        const { data: currentAnime, error: refetchError } = await supabase
          .from('animes')
          .select('*');

        if (refetchError) throw refetchError;
        
        setAnimeList(currentAnime);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [toast]);

  const handleAnimeSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('animes')
        .insert([data]);

      if (error) throw error;
      
      toast({
        title: "Аниме добавлено",
        description: "Новое аниме успешно добавлено в базу данных",
      });
      
      // Refresh the anime list
      const { data: updatedAnime } = await supabase
        .from('animes')
        .select('*');
      
      setAnimeList(updatedAnime || []);
    } catch (error) {
      console.error('Error adding anime:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить аниме",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-6">Loading...</div>;
  }

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