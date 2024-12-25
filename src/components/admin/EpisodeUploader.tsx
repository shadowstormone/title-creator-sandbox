import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useState } from "react";

interface EpisodeUploaderProps {
  animeId: string;
  onUpload: (data: any) => void;
}

const EpisodeUploader = ({ animeId, onUpload }: EpisodeUploaderProps) => {
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [video, setVideo] = useState<File | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload({ animeId, episodeNumber, video });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            type="button"
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
  );
};

export default EpisodeUploader;