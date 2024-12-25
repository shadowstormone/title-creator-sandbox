import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Artplayer from "artplayer";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AnimeDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState<Artplayer | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState("1");

  // Временные данные (в будущем будут загружаться из базы данных)
  const animeData = {
    title: "Наруто",
    titleEn: "Naruto",
    description: "История о молодом ниндзя Наруто Узумаки, мечтающем стать Хокаге — сильнейшим ниндзя и главой своей деревни.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    genres: ["Сёнен", "Боевик", "Приключения"],
    totalEpisodes: 220,
    uploadedEpisodes: 210,
    year: 2002,
    season: "Осень",
    studio: "Studio Pierrot",
    voiceActing: "AniLibria",
    timing: "Timing Team",
    videoUrl: "https://example.com/video.mp4",
  };

  useEffect(() => {
    const art = new Artplayer({
      container: ".artplayer-app",
      url: `${animeData.videoUrl}?episode=${currentEpisode}`,
      volume: 0.5,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: true,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: "#23ade5",
    });

    setPlayer(art);

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [currentEpisode]);

  const handleEpisodeChange = (episode: string) => {
    setCurrentEpisode(episode);
    if (player) {
      player.switchUrl(`${animeData.videoUrl}?episode=${episode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <img
                src={animeData.image}
                alt={animeData.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-purple-400">{animeData.title}</h1>
              <p className="text-gray-300">{animeData.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Информация:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>Год: {animeData.year}</li>
                    <li>Сезон: {animeData.season}</li>
                    <li>Студия: {animeData.studio}</li>
                    <li>Серии: {animeData.uploadedEpisodes} из {animeData.totalEpisodes}</li>
                    <li>Озвучка: {animeData.voiceActing}</li>
                    <li>Тайминг: {animeData.timing}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Жанры:</h3>
                  <div className="flex flex-wrap gap-2">
                    {animeData.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-purple-600 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Выберите серию:</label>
            <Select value={currentEpisode} onValueChange={handleEpisodeChange}>
              <SelectTrigger className="bg-gray-700 border-gray-600 w-[200px]">
                <SelectValue placeholder="Выберите серию" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: animeData.uploadedEpisodes }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Серия {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="artplayer-app w-full aspect-video bg-black rounded-lg overflow-hidden"></div>
        </Card>
      </div>
    </div>
  );
};

export default AnimeDetails;