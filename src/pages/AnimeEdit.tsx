import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimeForm from "@/components/admin/AnimeForm";
import EpisodeUploader from "@/components/admin/EpisodeUploader";
import { useToast } from "@/components/ui/use-toast";

const AnimeEdit = () => {
  const { id } = useParams();
  const { toast } = useToast();

  // Здесь будет загрузка данных аниме по id
  const animeData = {
    title: "Наруто",
    titleEn: "Naruto",
    description: "История о молодом ниндзя...",
    genres: "Сёнен,Боевик,Приключения",
    totalEpisodes: 220,
    uploadedEpisodes: 210,
    year: 2002,
    season: "Осень",
    studio: "Studio Pierrot",
    voiceActing: "AniLibria",
    timing: "Timing Team",
  };

  const handleAnimeUpdate = (data: any) => {
    console.log("Обновление аниме:", data);
    toast({
      title: "Аниме обновлено",
      description: "Изменения успешно сохранены",
    });
  };

  const handleEpisodeUpload = (data: any) => {
    console.log("Загрузка серии:", data);
    toast({
      title: "Серия загружена",
      description: `Серия ${data.episodeNumber} успешно загружена`,
    });
  };

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

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Загрузка новой серии</CardTitle>
          </CardHeader>
          <CardContent>
            <EpisodeUploader animeId={id!} onUpload={handleEpisodeUpload} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnimeEdit;