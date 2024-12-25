import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

// Временные данные (в будущем будут загружаться из базы данных)
const mockAnimeList = [
  { id: 1, title: "Наруто", episodes: 220 },
  { id: 2, title: "Блич", episodes: 366 },
];

const Admin = () => {
  const { toast } = useToast();
  const [selectedAnime, setSelectedAnime] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Аниме добавлено",
      description: "Новое аниме успешно добавлено в базу данных",
    });
    // Здесь будет логика сохранения данных
    console.log({ title, description, genres: genres.split(","), episodes: Number(episodes), image, video });
  };

  const handleEpisodeUpload = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Серия загружена",
      description: `Серия ${episodeNumber} успешно загружена`,
    });
    // Здесь будет логика загрузки серии
    console.log({ animeId: selectedAnime, episodeNumber, video });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-purple-400">Админ панель</h1>
        
        {/* Форма добавления нового аниме */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Добавить новое аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2">Название</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Введите название аниме"
                />
              </div>

              <div>
                <label className="block mb-2">Описание</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Введите описание аниме"
                  rows={4}
                />
              </div>

              <div>
                <label className="block mb-2">Жанры (через запятую)</label>
                <Input
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Сёнен, Боевик, Приключения"
                />
              </div>

              <div>
                <label className="block mb-2">Количество серий</label>
                <Input
                  type="number"
                  value={episodes}
                  onChange={(e) => setEpisodes(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Введите количество серий"
                />
              </div>

              <div>
                <label className="block mb-2">Обложка</label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    className="bg-gray-700 border-gray-600"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Загрузить изображение
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {image && <span className="text-sm text-gray-400">{image.name}</span>}
                </div>
              </div>

              <div>
                <label className="block mb-2">Превью видео</label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    className="bg-gray-700 border-gray-600"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Загрузить видео
                  </Button>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                  {video && <span className="text-sm text-gray-400">{video.name}</span>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Добавить аниме
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Управление сериями */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Управление сериями</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEpisodeUpload} className="space-y-6">
              <div>
                <label className="block mb-2">Выберите аниме</label>
                <Select value={selectedAnime} onValueChange={setSelectedAnime}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Выберите аниме" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAnimeList.map((anime) => (
                      <SelectItem key={anime.id} value={anime.id.toString()}>
                        {anime.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-2">Номер серии</label>
                <Input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Введите номер серии"
                />
              </div>

              <div>
                <label className="block mb-2">Видео серии</label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    className="bg-gray-700 border-gray-600"
                    onClick={() => document.getElementById('episode-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Загрузить серию
                  </Button>
                  <input
                    id="episode-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                  {video && <span className="text-sm text-gray-400">{video.name}</span>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                <Upload className="mr-2 h-4 w-4" />
                Загрузить серию
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Список аниме */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400">Список аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Серии</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAnimeList.map((anime) => (
                  <TableRow key={anime.id}>
                    <TableCell>{anime.id}</TableCell>
                    <TableCell>{anime.title}</TableCell>
                    <TableCell>{anime.episodes}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;