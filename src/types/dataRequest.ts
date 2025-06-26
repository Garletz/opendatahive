export interface DataRequest {
  id: string;
  title: string;
  objective: string;
  tags: string[];
  desiredFormat: string;
  budget?: number;
  deadline?: string;
  domain: string;
  contactEmail?: string;
  isPublic: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  requirements?: string[];
  selectedContributorId?: string;
  selectedContributorName?: string;
}

export interface DataRequestSubmission {
  id: string;
  requestId: string;
  submitterId: string;
  submitterName: string;
  octoId?: string;
  message: string;
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}