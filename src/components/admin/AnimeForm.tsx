import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import GenreSelect from "./GenreSelect";
import BasicAnimeInfo from "./BasicAnimeInfo";
import EpisodeInfo from "./EpisodeInfo";
import { supabase } from "@/lib/supabaseClient";

interface AnimeFormProps {
  initialData?: {
    title: string;
    titleEn: string;
    description: string;
    genres: string[];
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
    genres: [],
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

  const handleGenreChange = (selectedGenres: string[]) => {
    setFormData(prev => ({ ...prev, genres: selectedGenres }));
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
      let imageUrl = null;
      if (image) {
        const { data, error } = await supabase.storage
          .from('anime-images')
          .upload(`${Date.now()}-${image.name}`, image);
        
        if (error) throw error;
        imageUrl = data.path;
      }

      const animeData = {
        ...formData,
        imageUrl,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('animes')
        .insert([animeData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: initialData ? "Аниме обновлено" : "Аниме добавлено",
        description: initialData ? "Изменения сохранены успешно" : "Новое аниме добавлено успешно",
      });

      if (!initialData) {
        navigate(`/anime/${data.id}/${data.titleEn}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicAnimeInfo formData={formData} onChange={handleChange} />
      
      <div>
        <label className="block mb-2 text-white">Жанры</label>
        <GenreSelect
          selectedGenres={formData.genres}
          onChange={handleGenreChange}
        />
      </div>

      <EpisodeInfo formData={formData} onChange={handleChange} />

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