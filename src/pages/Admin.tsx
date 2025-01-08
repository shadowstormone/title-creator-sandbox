import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AnimeForm from "@/components/admin/AnimeForm";
import UserManagement from "@/components/admin/UserManagement";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/auth/useAuth";
import { Anime } from "@/lib/types";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      // Check if user has admin access in the database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, is_superadmin')
        .eq('id', user.id)
        .single();

      if (error || (!profile?.is_superadmin && !["creator", "admin"].includes(profile?.role || ""))) {
        console.error("Access denied:", error || "Insufficient permissions");
        navigate("/");
        toast({
          title: "Доступ запрещен",
          description: "У вас нет прав для доступа к админ панели",
          variant: "destructive",
        });
        return;
      }

      fetchAnimeList();
    };

    checkAccess();
  }, [user, navigate, toast]);

  const fetchAnimeList = async () => {
    try {
      const { data, error } = await supabase
        .from('animes')
        .select('*');

      if (error) throw error;
      setAnimeList(data || []);
    } catch (error) {
      console.error('Error fetching anime:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список аниме",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeSubmit = async (data: Partial<Anime>) => {
    try {
      const { data: newAnime, error } = await supabase
        .from('animes')
        .insert([{
          title: data.title,
          title_en: data.title_en,
          description: data.description,
          genres: data.genres,
          total_episodes: data.total_episodes,
          uploaded_episodes: data.uploaded_episodes,
          year: data.year,
          season: data.season,
          studio: data.studio,
          voice_acting: data.voice_acting,
          timing: data.timing,
          image_url: data.image_url,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Аниме добавлено",
      });

      await fetchAnimeList();
      if (newAnime) {
        navigate(`/anime/${newAnime.id}/${newAnime.title_en}`);
      }
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
    return <div className="min-h-screen bg-gray-900 text-white p-6">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-purple-400">Админ панель</h1>
          <Link to="/admin/statistics">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Статистика
            </Button>
          </Link>
        </div>

        <UserManagement />
        
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
                      {anime.uploaded_episodes} из {anime.total_episodes}
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/anime/${anime.id}/${anime.title_en}`}>
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