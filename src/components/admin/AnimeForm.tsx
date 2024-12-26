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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    
    try {
      console.log('Submitting form data:', formData);
      
      let image_url = null;
      if (image) {
        console.log('Uploading image...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('anime-images')
          .upload(`${Date.now()}-${image.name}`, image);
        
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }
        
        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('anime-images')
          .getPublicUrl(uploadData.path);
        
        image_url = publicUrl;
        console.log('Image uploaded successfully:', image_url);
      }

      const animeData = {
        ...formData,
        image_url,
        created_at: new Date().toISOString(),
      };

      console.log('Inserting anime data:', animeData);
      
      const { data, error } = await supabase
        .from('animes')
        .insert([animeData])
        .select()
        .single();

      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }

      console.log('Anime data inserted successfully:', data);

      toast({
        title: initialData ? "Аниме обновлено" : "Аниме добавлено",
        description: initialData ? "Изменения сохранены успешно" : "Новое аниме добавлено успешно",
      });

      if (!initialData && data) {
        navigate(`/anime/${data.id}/${data.titleEn}`);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
          {image && <span className="text-sm text-white">{image.name}</span>}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Сохранение..." : (initialData ? "Сохранить изменения" : "Добавить аниме")}
      </Button>
    </form>
  );
};

export default AnimeForm;