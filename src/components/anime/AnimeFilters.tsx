import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnimeFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedGenre: string;
  setSelectedGenre: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  selectedSeason: string;
  setSelectedSeason: (value: string) => void;
  selectedStudio: string;
  setSelectedStudio: (value: string) => void;
  allGenres: string[];
  allYears: number[];
  allSeasons: string[];
  allStudios: string[];
}

const AnimeFilters = ({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedYear,
  setSelectedYear,
  selectedSeason,
  setSelectedSeason,
  selectedStudio,
  setSelectedStudio,
  allGenres,
  allYears,
  allSeasons,
  allStudios,
}: AnimeFiltersProps) => {
  return (
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
  );
};

export default AnimeFilters;