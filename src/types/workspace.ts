export type NodeType = 'link' | 'note' | 'media' | 'model' | 'container' | 'file';

export interface HiveNode {
    id: string;
    projectId: string;
    type: NodeType;

    // Position in the hex grid
    q: number;
    r: number;

    // Core Data
    title: string;
    description?: string;

    // Content (Union type simplified for now)
    content: {
        url?: string; // For links
        text?: string; // For notes
        fileUrl?: string; // For media/models/files
        thumbnailUrl?: string;
    };

    // Visuals
    color?: string;
    icon?: string;

    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    userId: string;

    // Optional: Global settings for this project's visualization
    theme?: {
        primaryColor: string;
        skybox?: string;
    };
}
