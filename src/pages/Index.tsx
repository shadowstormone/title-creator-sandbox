import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Anime } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import AnimeGrid from "@/components/anime/AnimeGrid";
import AnimeFilters from "@/components/anime/AnimeFilters";

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
        setAnimeList([]);
        return;
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
      setAnimeList([]);
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
        
        <AnimeFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          selectedStudio={selectedStudio}
          setSelectedStudio={setSelectedStudio}
          allGenres={allGenres}
          allYears={allYears}
          allSeasons={allSeasons}
          allStudios={allStudios}
        />

        <AnimeGrid animeList={filteredAnime} />
      </div>
    </div>
  );
};

export default Index;