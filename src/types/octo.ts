export interface Octo {
  /**
   * Liste des fichiers associés à cet octo (md, webp, pdf, mp3, webm, json, csv, xml, glb, graphml, odhc, etc.)
   */
  files?: {
    name: string;
    url?: string;
    type: 'md' | 'webp' | 'pdf' | 'mp3' | 'webm' | 'json' | 'csv' | 'xml' | 'glb' | 'graphml' | 'odhc' | string;
    file?: File;
    [key: string]: any; // Pour des métadonnées additionnelles
  }[];

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
  // Statistiques publiques (visibles par tous)
  viewCount?: number;
  // Statistiques privées (visibles seulement par le propriétaire)
  // Nesting support
  isNested?: boolean;
  nestedGroupId?: string;
  position?: number;

  stats?: {
    views: number;
    clicks: number;
    likes: number;
    downloads: number;
    score: number;
    trending: boolean;
  };
}