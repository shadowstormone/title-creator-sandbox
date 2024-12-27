import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Statistics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalAnime: 0,
    totalEpisodes: 0,
    popularGenres: [],
    viewsByMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch basic stats
      const { data: animeData, error: animeError } = await supabase
        .from('animes')
        .select('*');

      if (animeError) throw animeError;

      // Calculate statistics
      const totalAnime = animeData?.length || 0;
      const totalEpisodes = animeData?.reduce((sum, anime) => sum + (anime.total_episodes || 0), 0) || 0;
      
      // Calculate genre popularity
      const genreCounts = {};
      animeData?.forEach(anime => {
        anime.genres?.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });

      const popularGenres = Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Mock monthly views data (replace with real data when available)
      const viewsByMonth = [
        { month: "Янв", views: 400 },
        { month: "Фев", views: 300 },
        { month: "Мар", views: 600 },
        { month: "Апр", views: 800 },
        { month: "Май", views: 1000 },
        { month: "Июн", views: 1200 },
      ];

      setStats({
        totalAnime,
        totalEpisodes,
        popularGenres,
        viewsByMonth,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-6">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-purple-400">Статистика</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-purple-400">Общая информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Всего аниме</p>
                  <p className="text-2xl font-bold">{stats.totalAnime}</p>
                </div>
                <div>
                  <p className="text-gray-400">Всего эпизодов</p>
                  <p className="text-2xl font-bold">{stats.totalEpisodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-purple-400">Популярные жанры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <BarChart width={400} height={250} data={stats.popularGenres}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 col-span-full">
            <CardHeader>
              <CardTitle className="text-purple-400">Просмотры по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart width={800} height={250} data={stats.viewsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" />
                </LineChart>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;