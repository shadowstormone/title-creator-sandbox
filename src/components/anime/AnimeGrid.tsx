import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anime } from "@/lib/types";

interface AnimeGridProps {
  animeList: Anime[];
}

const AnimeGrid = ({ animeList }: AnimeGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {animeList.map((anime) => (
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
  );
};

export default AnimeGrid;