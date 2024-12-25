import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Временные данные (в будущем будут загружаться из базы данных)
const animeData = [
  { 
    id: 1, 
    title: "Наруто", 
    titleEn: "naruto",
    genres: ["Сёнен", "Боевик", "Приключения"],
    year: 2002,
    season: "Осень",
    studio: "Studio Pierrot",
    image: "path/to/naruto.jpg" 
  },
  { 
    id: 2, 
    title: "Блич", 
    titleEn: "bleach",
    genres: ["Сёнен", "Боевик", "Сверхъестественное"],
    year: 2004,
    season: "Осень",
    studio: "Studio Pierrot",
    image: "path/to/bleach.jpg"
  },
];

const allGenres = Array.from(new Set(animeData.flatMap(anime => anime.genres)));
const allYears = Array.from(new Set(animeData.map(anime => anime.year))).sort((a, b) => b - a);
const allSeasons = ["Зима", "Весна", "Лето", "Осень"];
const allStudios = Array.from(new Set(animeData.map(anime => anime.studio)));

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedStudio, setSelectedStudio] = useState("all");

  const filteredAnime = animeData.filter((anime) => {
    const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anime.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || anime.genres.includes(selectedGenre);
    const matchesYear = selectedYear === "all" || anime.year.toString() === selectedYear;
    const matchesSeason = selectedSeason === "all" || anime.season === selectedSeason;
    const matchesStudio = selectedStudio === "all" || anime.studio === selectedStudio;

    return matchesSearch && matchesGenre && matchesYear && matchesSeason && matchesStudio;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400">Anime Portal</h1>
          <Link to="/admin">
            <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 border-none text-white">
              Админ панель
            </Button>
          </Link>
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
            <Link to={`/anime/${anime.id}-${anime.titleEn}`} key={anime.id}>
              <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] relative mb-3">
                    <img
                      src={anime.image}
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