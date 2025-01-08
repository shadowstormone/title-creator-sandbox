import { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { Rating } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

interface AnimeRatingProps {
  ratings: Rating[];
  animeId: number;
  onRate: (score: number) => void;
}

const AnimeRating = ({ ratings, animeId, onRate }: AnimeRatingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1)
    : "0.0";

  const userRating = user
    ? ratings.find(r => r.userId === user.id)?.score
    : null;

  const handleRate = (score: number) => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему чтобы оценить аниме",
        variant: "destructive",
      });
      return;
    }
    onRate(score);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={!user}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                (hoveredStar !== null ? star <= hoveredStar : star <= (userRating || 0))
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-400">
        Рейтинг: {averageRating} ({ratings.length} голосов)
      </div>
    </div>
  );
};

export default AnimeRating;