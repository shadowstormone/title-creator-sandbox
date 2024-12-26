import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimeForm from "@/components/admin/AnimeForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

const AnimeEdit = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('animes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Ensure genres is always an array
          const formattedData = {
            ...data,
            genres: Array.isArray(data.genres) ? data.genres : []
          };
          setAnimeData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching anime:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные аниме",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id, toast]);

  const handleAnimeUpdate = async (data: any) => {
    try {
      const { error } = await supabase
        .from('animes')
        .update({
          ...data,
          genres: Array.isArray(data.genres) ? data.genres : []
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Аниме обновлено",
      });
    } catch (error) {
      console.error('Error updating anime:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить аниме",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-purple-400">
          Редактирование: {animeData?.title}
        </h1>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Информация об аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimeForm initialData={animeData} onSubmit={handleAnimeUpdate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnimeEdit;