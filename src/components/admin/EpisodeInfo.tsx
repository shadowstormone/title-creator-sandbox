import { Input } from "@/components/ui/input";

interface EpisodeInfoProps {
  formData: {
    totalEpisodes: number;
    uploadedEpisodes: number;
    voiceActing: string;
    timing: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EpisodeInfo = ({ formData, onChange }: EpisodeInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block mb-2 text-white">Всего серий</label>
        <Input
          type="number"
          name="totalEpisodes"
          value={formData.totalEpisodes}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Загружено серий</label>
        <Input
          type="number"
          name="uploadedEpisodes"
          value={formData.uploadedEpisodes}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Озвучка</label>
        <Input
          name="voiceActing"
          value={formData.voiceActing}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Тайминг</label>
        <Input
          name="timing"
          value={formData.timing}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default EpisodeInfo;