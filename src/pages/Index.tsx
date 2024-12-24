import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const animeData = [
  { id: 1, title: "Naruto", image: "path/to/naruto.jpg" },
  { id: 2, title: "One Piece", image: "path/to/onepiece.jpg" },
  { id: 3, title: "Attack on Titan", image: "path/to/aot.jpg" },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnime = animeData.filter((anime) =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400">Anime Portal</h1>
          <Link to="/admin">
            <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 border-none">
              Админ панель
            </Button>
          </Link>
        </div>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск аниме..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAnime.map((anime) => (
            <Link to={`/anime/${anime.id}`} key={anime.id}>
              <Card 
                className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer"
              >
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