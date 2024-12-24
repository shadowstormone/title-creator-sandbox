import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";

const Admin = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

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
    // Здесь будет логика сохранения данных
    console.log({ title, description, image, video });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-purple-400">Админ панель</h1>
        
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
                <label className="block mb-2">Видео</label>
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
      </div>
    </div>
  );
};

export default Admin;