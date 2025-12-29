import AppContent from './AppContent';
import RootProviders from './RootProviders';
import { ProjectProvider } from './context/ProjectContext';

function App() {
  return (
    <RootProviders>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </RootProviders>
  );
}

export default App;