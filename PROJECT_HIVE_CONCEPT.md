# Project Hive: Spatial Project Operating System

## Vision
Transform OpenDataHive from a data-sharing platform into a **spatial "desktop" for multi-disciplinary project management**. 
Instead of a simple file explorer, each project is an immersive "Hive" — a 3D hexagonal workspace where resources are spatially organized.

## Core Concepts

### 1. The Workspace (Meta-Layer)
- **Sidebar Navigation**: Similar to ChatGPT or Notion.
  - List of active projects (e.g., "AI Assistant", "Home Renovation", "Marketing Campaign").
  - "New Project" button.
- **Global Search**: Ability for the AI to query *across* all projects ("Where did I put the invoice for X?").

### 2. The Project (The Container)
- A dedicated isolate environment.
- **Data**:
  - `id`: Unique identifier.
  - `name`: Display name.
  - `description`: Context for the AI.
  - `nodes`: Collection of hexagonal nodes.

### 3. Hive Nodes (The Content)
Each hexagon on the grid represents a resource or a "place":

| Node Type | Function | Visual Representation |
|-----------|----------|-----------------------|
| **Link** | Shortcut to external tools (GitHub, Trello, Google Drive) | 3D Icon / Logo floating over hex |
| **Note** | Text/Notion-like page for quick scratches | Text preview panel |
| **Media** | Images, Videos | Billboard / Thumbnail in 3D |
| **Model** | 3D Asset (GLB/GLTF) | The actual 3D model placed on the grid |
| **Container** | Folder/Group | A generic "box" or "building" that opens a sub-grid or modal |

### 4. Integration Logic
- **Not an "Everything App"**: The Hive doesn't *replace* Photoshop or VS Code. It links to them.
- **Central Context**: The Hive stores the *metadata* and *relationships* between files, enabling the AI to understand the project structure.

## AI "HiveMind" Role
The Chat interface moves from a simple "helper" to a **Context-Aware Project Manager**.
- **Queries**: "Where is the design for the login page?" -> AI highlights the Figma Link Node and the specific Screenshot Node on the map.
- **Action**: "Create a new note adjacent to the GitHub link" -> AI updates the grid layout.

## Technical Migration Path

1.  **Data Model Update**:
    - Rename/Refactor `Octo` entity to `HiveNode` (or generalized Resource).
    - Introduce `Project` entity to group Nodes.
2.  **UI Overhaul**:
    - **Sidebar**: Switch from "Filter Tags" to "Project List".
    - **Grid**: Load data based on `activeProjectID` instead of fetching all global items.
3.  **Visualization**:
    - Implement specialized 3D renders for different Node Types (standardize visual cues).
