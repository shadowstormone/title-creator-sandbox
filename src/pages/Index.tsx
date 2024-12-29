import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { Anime } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedStudio, setSelectedStudio] = useState("all");
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Component mounted, starting initial fetch");
    fetchAnimeList();
  }, []);

  const fetchAnimeList = async () => {
    console.log("fetchAnimeList started, current loading state:", loading);
    try {
      const { data, error } = await supabase
        .from('animes')
        .select('*');

      console.log("Supabase response received:", { data, error });

      if (error) {
        console.error('Error fetching anime:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список аниме",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        console.log("No data received from Supabase");
        setAnimeList([]);
      } else {
        console.log("Setting anime list with data:", data.length, "items");
        setAnimeList(data);
      }
    } catch (error) {
      console.error('Error in fetchAnimeList:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список аниме",
        variant: "destructive",
      });
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const filteredAnime = animeList.filter((anime) => {
    const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anime.title_en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || anime.genres.includes(selectedGenre);
    const matchesYear = selectedYear === "all" || anime.year.toString() === selectedYear;
    const matchesSeason = selectedSeason === "all" || anime.season === selectedSeason;
    const matchesStudio = selectedStudio === "all" || anime.studio === selectedStudio;

    return matchesSearch && matchesGenre && matchesYear && matchesSeason && matchesStudio;
  });

  const allGenres = Array.from(new Set(animeList.flatMap(anime => anime.genres)));
  const allYears = Array.from(new Set(animeList.map(anime => anime.year))).sort((a, b) => b - a);
  const allSeasons = ["Зима", "Весна", "Лето", "Осень"];
  const allStudios = Array.from(new Set(animeList.map(anime => anime.studio)));

  console.log("Render state:", { loading, animeListLength: animeList.length });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400">Anime Portal</h1>
        </div>
        
        <div className="space-y-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск аниме..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue placeholder="Год" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-100">
                <SelectItem value="all">Все годы</SelectItem>
                {allYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue placeholder="Сезон" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-100">
                <SelectItem value="all">Все сезоны</SelectItem>
                {allSeasons.map(season => (
                  <SelectItem key={season} value={season}>{season}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStudio} onValueChange={setSelectedStudio}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue placeholder="Студия" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-100">
                <SelectItem value="all">Все студии</SelectItem>
                {allStudios.map(studio => (
                  <SelectItem key={studio} value={studio}>{studio}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue placeholder="Жанр" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-100">
                <SelectItem value="all">Все жанры</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAnime.map((anime) => (
            <Link to={`/anime/${anime.id}/${anime.title_en}`} key={anime.id}>
              <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] relative mb-3">
                    <img
                      src={anime.image_url || '/placeholder.svg'}
                      alt={anime.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-400 hover:text-purple-300">
                    {anime.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs text-gray-300">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;