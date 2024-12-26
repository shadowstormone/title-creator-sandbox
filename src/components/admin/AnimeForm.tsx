import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AnimeFormProps {
  initialData?: {
    title: string;
    titleEn: string;
    description: string;
    genres: string;
    totalEpisodes: number;
    uploadedEpisodes: number;
    year: number;
    season: string;
    studio: string;
    voiceActing: string;
    timing: string;
  };
  onSubmit: (data: any) => void;
}

const AnimeForm = ({ initialData, onSubmit }: AnimeFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialData || {
    title: "",
    titleEn: "",
    description: "",
    genres: "",
    totalEpisodes: 0,
    uploadedEpisodes: 0,
    year: new Date().getFullYear(),
    season: "",
    studio: "",
    voiceActing: "",
    timing: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({ ...formData, image, video });
      toast({
        title: initialData ? "Аниме обновлено" : "Аниме добавлено",
        description: initialData ? "Изменения сохранены успешно" : "Новое аниме добавлено успешно",
      });
      if (!initialData) {
        // Если это новое аниме, перенаправляем на главную страницу
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-white">Название</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Английское название</label>
          <Input
            name="titleEn"
            value={formData.titleEn}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Год</label>
          <Input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Сезон</label>
          <Input
            name="season"
            value={formData.season}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Студия</label>
          <Input
            name="studio"
            value={formData.studio}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Всего серий</label>
          <Input
            type="number"
            name="totalEpisodes"
            value={formData.totalEpisodes}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Загружено серий</label>
          <Input
            type="number"
            name="uploadedEpisodes"
            value={formData.uploadedEpisodes}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Озвучка</label>
          <Input
            name="voiceActing"
            value={formData.voiceActing}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-white">Тайминг</label>
          <Input
            name="timing"
            value={formData.timing}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-white">Описание</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          rows={4}
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Жанры (через запятую)</label>
        <Input
          name="genres"
          value={formData.genres}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Обложка</label>
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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
          {image && <span className="text-sm text-white">{image.name}</span>}
        </div>
      </div>

      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
        {initialData ? "Сохранить изменения" : "Добавить аниме"}
      </Button>
    </form>
  );
};

export default AnimeForm;