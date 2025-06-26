export interface UserInteraction {
  id: string;
  userId: string;
  octoId: string;
  type: 'view' | 'click' | 'like' | 'download';
  timestamp: string;
  metadata?: {
    duration?: number; // Pour les vues
    source?: string; // D'où vient l'interaction
  };
}

export interface OctoStats {
  octoId: string;
  views: number;
  clicks: number;
  likes: number;
  downloads: number;
  score: number;
  lastUpdated: string;
  trending: boolean;
  trendingScore?: number;
}

export interface TrendingPeriod {
  period: '1h' | '24h' | '7d' | '30d';
  label: string;
}