export type UserRole = 
  | "creator" // Создатель
  | "admin" // Админ
  | "moderator" // Модератор
  | "technician" // Технарь
  | "dubber" // Даббер
  | "vip" // VIP пользователь
  | "subscriber" // Подписчик
  | "user"; // Обычный пользователь

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  animeId: number;
  content: string;
  createdAt: Date;
  likes: string[]; // Array of user IDs who liked
  dislikes: string[]; // Array of user IDs who disliked
}

export interface Rating {
  userId: string;
  animeId: number;
  score: number; // 1-5 stars
}

export interface Anime {
  id: number;
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
  imageUrl?: string;
  ratings: Rating[];
  comments: Comment[];
}