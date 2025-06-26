export interface Octo {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  access: string;
  format: string;
  addedAt: string;
  authorId?: string;
  authorName?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  likes?: number;
  views?: number;
  isNested?: boolean;
  parentId?: string;
  position?: number;
  nestedGroupId?: string;
  // Statistiques publiques (visibles par tous)
  viewCount?: number;
  // Statistiques privées (visibles seulement par le propriétaire)
  stats?: {
    views: number;
    clicks: number;
    likes: number;
    downloads: number;
    score: number;
    trending: boolean;
  };
}