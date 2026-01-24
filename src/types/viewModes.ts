/**
 * View Mode Definitions
 * Each mode has specific behaviors and UI configurations
 */

export type ViewMode = 'public' | 'personal' | 'projects' | 'all-users' | 'chat';

export interface ViewModeConfig {
    id: ViewMode;
    name: string;
    description: string;
    icon: string;
    color: string;

    // Behavior flags
    showSidebar: boolean;           // Show sidebar panel
    persistData: boolean;           // Save data to Firebase
    showProjectNodes: boolean;      // Display HiveNodes on grid
    showOctos: boolean;             // Display Octos on grid
    showUsers: boolean;             // Display user markers
    allowNodeCreation: boolean;     // Allow creating new nodes
    allowNodeEditing: boolean;      // Allow editing existing nodes

    // Default view state
    defaultCenterObject?: 'sun' | 'project' | 'user' | 'none';
}

/**
 * MY PROJECTS Mode
 * Primary workspace for organizing projects with persistent storage
 * - Sidebar visible with project list
 * - All data persists to Firebase
 * - Click grid to add nodes at specific positions
 * - Central project logo for each project
 */
export const PROJECT_MODE: ViewModeConfig = {
    id: 'projects',
    name: 'My Projects',
    description: 'Organize your projects. Everything saves automatically.',
    icon: '📁',
    color: '#f59e0b', // amber
    showSidebar: true,
    persistData: true,
    showProjectNodes: true,
    showOctos: false,
    showUsers: false,
    allowNodeCreation: true,
    allowNodeEditing: true,
    defaultCenterObject: 'project',
};

/**
 * MY HIVE Mode
 * Personal permanent storage for user's most important data
 * - Single unique space per user
 * - All data persists
 * - More personal/private than projects
 */
export const HIVE_MODE: ViewModeConfig = {
    id: 'personal',
    name: 'My Hive',
    description: 'Your personal permanent storage. Stores everything.',
    icon: '🏠',
    color: '#10b981', // emerald
    showSidebar: false,
    persistData: true,
    showProjectNodes: false,
    showOctos: true,
    showUsers: false,
    allowNodeCreation: true,
    allowNodeEditing: true,
    defaultCenterObject: 'sun',
};

/**
 * CHAT Mode
 * Sandbox/temporary testing environment
 * - Nothing persists after session
 * - Can give instructions to AI architect
 * - Experimental mode for testing ideas
 */
export const CHAT_MODE: ViewModeConfig = {
    id: 'chat',
    name: 'Chat',
    description: 'Sandbox mode. Test ideas temporarily, nothing saves.',
    icon: '💬',
    color: '#8b5cf6', // violet
    showSidebar: false,
    persistData: false,
    showProjectNodes: false,
    showOctos: false,
    showUsers: false,
    allowNodeCreation: true,
    allowNodeEditing: true,
    defaultCenterObject: 'none',
};

/**
 * ALL USERS Mode
 * Browse other users' hives
 * - Shows user markers on the grid
 * - Click user to visit their hive
 * - Read-only access to public content
 */
export const ALL_USERS_MODE: ViewModeConfig = {
    id: 'all-users',
    name: 'All Users',
    description: 'Explore other users\' hives and public content.',
    icon: '👥',
    color: '#3b82f6', // blue
    showSidebar: false,
    persistData: false,
    showProjectNodes: false,
    showOctos: false,
    showUsers: true,
    allowNodeCreation: false,
    allowNodeEditing: false,
    defaultCenterObject: 'none',
};

/**
 * PUBLIC Mode
 * Shared public space (definition TBD)
 * - Publicly visible content
 * - Community-driven data
 */
export const PUBLIC_MODE: ViewModeConfig = {
    id: 'public',
    name: 'Public',
    description: 'Public shared space. Definition in progress.',
    icon: '🌐',
    color: '#06b6d4', // cyan
    showSidebar: false,
    persistData: true,
    showProjectNodes: false,
    showOctos: true,
    showUsers: false,
    allowNodeCreation: false,
    allowNodeEditing: false,
    defaultCenterObject: 'sun',
};

// Mode lookup map
export const VIEW_MODES: Record<ViewMode, ViewModeConfig> = {
    'projects': PROJECT_MODE,
    'personal': HIVE_MODE,
    'chat': CHAT_MODE,
    'all-users': ALL_USERS_MODE,
    'public': PUBLIC_MODE,
};

// Default mode
export const DEFAULT_VIEW_MODE: ViewMode = 'projects';

// Helper function
export function getViewModeConfig(mode: ViewMode): ViewModeConfig {
    return VIEW_MODES[mode];
}
