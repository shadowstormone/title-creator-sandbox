import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const genres = [
  "Боевик", "Комедия", "Драма", "Фэнтези", "Ужасы", 
  "Меха", "Музыкальный", "Романтика", "Научная фантастика", 
  "Спорт", "Сёнэн", "Сёдзё", "Повседневность", "Психологическое"
];

interface GenreSelectProps {
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
}

const GenreSelect = ({ selectedGenres = [], onChange }: GenreSelectProps) => {
  const [open, setOpen] = useState(false);

  const toggleGenre = (genre: string) => {
    const newSelection = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    onChange(newSelection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedGenres.length > 0
            ? `Выбрано жанров: ${selectedGenres.length}`
            : "Выберите жанры"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Поиск жанра..." />
          <CommandList>
            <CommandEmpty>Жанр не найден</CommandEmpty>
            <CommandGroup>
              {genres.map((genre) => (
                <CommandItem
                  key={genre}
                  value={genre}
                  onSelect={() => toggleGenre(genre)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedGenres.includes(genre) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {genre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GenreSelect;