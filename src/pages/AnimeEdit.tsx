import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimeForm from "@/components/admin/AnimeForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

const AnimeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) {
        navigate('/admin');
        return;
      }
      
      try {
        console.log('Fetching anime with ID:', id);
        const { data, error } = await supabase
          .from('animes')
          .select('*')
          .eq('id', parseInt(id)) // Convert string ID to number
          .single();

        if (error) {
          console.error('Error details:', error);
          throw error;
        }
        
        if (data) {
          console.log('Fetched anime data:', data);
          setAnimeData({
            ...data,
            genres: Array.isArray(data.genres) ? data.genres : []
          });
        } else {
          toast({
            title: "Аниме не найдено",
            description: "Запрошенное аниме не существует",
            variant: "destructive",
          });
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error fetching anime:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные аниме",
          variant: "destructive",
        });
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id, navigate, toast]);

  const handleAnimeUpdate = async (formData: any) => {
    try {
      console.log('Updating anime with data:', formData);
      
      // Remove any undefined or null values
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v != null)
      );

      const { error } = await supabase
        .from('animes')
        .update(cleanedData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Аниме обновлено",
      });
      
      navigate('/admin');
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

  if (!animeData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-purple-400">
          Редактирование: {animeData.title}
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