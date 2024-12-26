import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicAnimeInfoProps {
  formData: {
    title: string;
    titleEn: string;
    description: string;
    year: number;
    season: string;
    studio: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BasicAnimeInfo = ({ formData, onChange }: BasicAnimeInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block mb-2 text-white">Название</label>
        <Input
          name="title"
          value={formData.title}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Английское название</label>
        <Input
          name="titleEn"
          value={formData.titleEn}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Год</label>
        <Input
          type="number"
          name="year"
          value={formData.year}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Сезон</label>
        <Input
          name="season"
          value={formData.season}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block mb-2 text-white">Студия</label>
        <Input
          name="studio"
          value={formData.studio}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      <div className="col-span-2">
        <label className="block mb-2 text-white">Описание</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          rows={4}
        />
      </div>
    </div>
  );
};

export default BasicAnimeInfo;