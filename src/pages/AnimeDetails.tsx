import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Artplayer from "artplayer";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CommentList from "@/components/comments/CommentList";
import AnimeRating from "@/components/anime/AnimeRating";
import { useToast } from "@/components/ui/use-toast";
import { Comment, Rating } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

const AnimeDetails = () => {
  const { id, titleEn } = useParams();
  const { toast } = useToast();
  const [player, setPlayer] = useState<Artplayer | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState("1");
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [animeData, setAnimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const { data, error } = await supabase
          .from('animes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          console.log("Fetched anime data:", data);
          setAnimeData(data);
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

    fetchAnimeData();
  }, [id]);

  useEffect(() => {
    if (!animeData?.video_url) return;

    const art = new Artplayer({
      container: ".artplayer-app",
      url: `${animeData.video_url}?episode=${currentEpisode}`,
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
  }, [currentEpisode, animeData]);

  const handleEpisodeChange = (episode: string) => {
    setCurrentEpisode(episode);
    if (player && animeData?.video_url) {
      player.switchUrl(`${animeData.video_url}?episode=${episode}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-6">Загрузка...</div>;
  }

  if (!animeData) {
    return <div className="min-h-screen bg-gray-900 text-white p-6">Аниме не найдено</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <img
                src={animeData.image_url || "/placeholder.svg"}
                alt={animeData.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
              <div className="mt-4">
                <AnimeRating
                  ratings={ratings}
                  animeId={Number(id)}
                  onRate={(score) => {
                    const newRating: Rating = {
                      userId: "1",
                      animeId: Number(id),
                      score,
                    };
                    setRatings([...ratings.filter(r => r.userId !== "1"), newRating]);
                    toast({
                      title: "Оценка добавлена",
                      description: "Ваша оценка успешно сохранена",
                    });
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-purple-400">
                {animeData.title} / {animeData.title_en}
              </h1>
              <p className="text-gray-300">{animeData.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Информация:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>Год: {animeData.year}</li>
                    <li>Сезон: {animeData.season}</li>
                    <li>Студия: {animeData.studio}</li>
                    <li>Серии: {animeData.uploaded_episodes} из {animeData.total_episodes}</li>
                    <li>Озвучка: {animeData.voice_acting}</li>
                    <li>Тайминг: {animeData.timing}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Жанры:</h3>
                  <div className="flex flex-wrap gap-2">
                    {animeData.genres?.map((genre: string) => (
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
                {Array.from({ length: animeData.uploaded_episodes || 0 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Серия {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="artplayer-app w-full aspect-video bg-black rounded-lg overflow-hidden"></div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">Комментарии</h2>
          <CommentList
            animeId={Number(id)}
            comments={comments}
            onAddComment={(content: string) => {
              const newComment: Comment = {
                id: String(comments.length + 1),
                userId: "1",
                animeId: Number(id),
                content,
                createdAt: new Date(),
                likes: [],
                dislikes: [],
              };
              setComments([...comments, newComment]);
              toast({
                title: "Комментарий добавлен",
                description: "Ваш комментарий успешно добавлен",
              });
            }}
            onDeleteComment={(commentId: string) => {
              setComments(comments.filter(c => c.id !== commentId));
              toast({
                title: "Комментарий удален",
                description: "Комментарий успешно удален",
              });
            }}
            onEditComment={(commentId: string, content: string) => {
              setComments(comments.map(c => 
                c.id === commentId ? { ...c, content } : c
              ));
              toast({
                title: "Комментарий изменен",
                description: "Комментарий успешно изменен",
              });
            }}
            onLikeComment={(commentId: string) => {
              setComments(comments.map(c => {
                if (c.id === commentId) {
                  const hasLiked = c.likes.includes("1");
                  const likes = hasLiked
                    ? c.likes.filter(id => id !== "1")
                    : [...c.likes, "1"];
                  return {
                    ...c,
                    likes,
                    dislikes: c.dislikes.filter(id => id !== "1"),
                  };
                }
                return c;
              }));
            }}
            onDislikeComment={(commentId: string) => {
              setComments(comments.map(c => {
                if (c.id === commentId) {
                  const hasDisliked = c.dislikes.includes("1");
                  const dislikes = hasDisliked
                    ? c.dislikes.filter(id => id !== "1")
                    : [...c.dislikes, "1"];
                  return {
                    ...c,
                    dislikes,
                    likes: c.likes.filter(id => id !== "1"),
                  };
                }
                return c;
              }));
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default AnimeDetails;