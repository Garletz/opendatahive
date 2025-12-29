export interface DataRequest {
  id: string;
  title: string;
  objective: string;
  tags: string[];
  desiredFormat: string;
  budget?: number;
  deadline?: string | null;
  domain: string;
  contactEmail?: string | null;
  isPublic: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submissionsCount?: number;
  // Contributor selected to fulfill the request (if any)
  selectedContributorId?: string;
  selectedContributorName?: string;
  description?: string;
  requirements?: string[];
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