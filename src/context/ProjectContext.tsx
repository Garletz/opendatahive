import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, HiveNode } from '@/types';
import { useAuth } from './AuthContext';
import { useFirebase } from './FirebaseContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';



interface ProjectContextType {
    projects: Project[];
    activeProject: Project | null;
    projectNodes: HiveNode[];
    setActiveProject: (project: Project | null) => void;
    createProject: (name: string, description: string) => Promise<void>;
    addNode: (node: Omit<HiveNode, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType>({
    projects: [],
    activeProject: null,
    projectNodes: [],
    setActiveProject: () => { },
    createProject: async () => { },
    addNode: async () => { },
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { db } = useFirebase();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [projectNodes, setProjectNodes] = useState<HiveNode[]>([]);
    // const [loading, setLoading] = useState(false);

    // Load projects for the user
    useEffect(() => {
        const fetchProjects = async () => {
            if (!user || !db) {
                setProjects([]);
                // Fallback to mock data for dev if no user/db
                // setProjects(MOCK_PROJECTS); 
                return;
            }

            try {
                // setLoading(true);
                const projectsRef = collection(db, 'projects');
                const q = query(projectsRef, where('userId', '==', user.id));
                const snapshot = await getDocs(q);
                const loadedProjects = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Project[];

                setProjects(loadedProjects);

                // Set default active project if none selected but projects exist
                if (loadedProjects.length > 0 && !activeProject) {
                    setActiveProject(loadedProjects[0]);
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
            } finally {
                // setLoading(false);
            }
        };

        fetchProjects();
    }, [user, db]);

    // Load nodes for active project
    useEffect(() => {
        const fetchNodes = async () => {
            if (!activeProject || !db) {
                setProjectNodes([]);
                return;
            }

            try {
                const nodesRef = collection(db, 'hiveNodes');
                const q = query(nodesRef, where('projectId', '==', activeProject.id));
                const snapshot = await getDocs(q);
                const loadedNodes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as HiveNode[];

                setProjectNodes(loadedNodes);
            } catch (err) {
                console.error("Error fetching nodes:", err);
            }
        };

        fetchNodes();
    }, [activeProject, db]);

    const createProject = async (name: string, description: string) => {
        if (!user || !db) return;

        try {
            const newProjectData: Omit<Project, 'id'> = {
                name,
                description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                userId: user.id
            };

            const docRef = await addDoc(collection(db, 'projects'), newProjectData);
            const newProject: Project = { ...newProjectData, id: docRef.id };

            setProjects(prev => [...prev, newProject]);
            setActiveProject(newProject);
        } catch (err) {
            console.error("Error creating project:", err);
        }
    };

    const addNode = async (nodeData: Omit<HiveNode, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!db) return;

        try {
            const newNodeData = {
                ...nodeData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'hiveNodes'), newNodeData);
            const newNode: HiveNode = { ...newNodeData, id: docRef.id };

            setProjectNodes(prev => [...prev, newNode]);
        } catch (err) {
            console.error("Error adding node:", err);
        }
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            activeProject,
            projectNodes,
            setActiveProject,
            createProject,
            addNode
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
