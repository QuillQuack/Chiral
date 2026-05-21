export interface GameData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  rating: number;
  downloadCount: number;
  coverData: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  username: string;
  avatar: string;
  text: string;
  upvotes: number;
  timestamp: string;
}
