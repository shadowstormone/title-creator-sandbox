import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, image, video });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2">Название</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Английское название</label>
          <Input
            name="titleEn"
            value={formData.titleEn}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Год</label>
          <Input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Сезон</label>
          <Input
            name="season"
            value={formData.season}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Студия</label>
          <Input
            name="studio"
            value={formData.studio}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Всего серий</label>
          <Input
            type="number"
            name="totalEpisodes"
            value={formData.totalEpisodes}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Загружено серий</label>
          <Input
            type="number"
            name="uploadedEpisodes"
            value={formData.uploadedEpisodes}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Озвучка</label>
          <Input
            name="voiceActing"
            value={formData.voiceActing}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-2">Тайминг</label>
          <Input
            name="timing"
            value={formData.timing}
            onChange={handleChange}
            className="bg-gray-700 border-gray-600"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">Описание</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="bg-gray-700 border-gray-600"
          rows={4}
        />
      </div>

      <div>
        <label className="block mb-2">Жанры (через запятую)</label>
        <Input
          name="genres"
          value={formData.genres}
          onChange={handleChange}
          className="bg-gray-700 border-gray-600"
        />
      </div>

      <div>
        <label className="block mb-2">Обложка</label>
        <div className="flex items-center space-x-4">
          <Button
            type="button"
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

      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
        {initialData ? "Сохранить изменения" : "Добавить аниме"}
      </Button>
    </form>
  );
};

export default AnimeForm;