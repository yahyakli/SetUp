import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project, Team } from "@/types";

// Define the initial state
interface ProjectsState {
  projects: Project[];
  projectLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  projectLoading: false,
  error: null,
};


// **Create Slice**
const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjectLoading: (state, action: PayloadAction<boolean>) => {
      state.projectLoading = action.payload;
    },
    initProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      state.projects = state.projects.map((project) => {
        if (project.id === action.payload.id) {
          return {
            ...action.payload,
            teams: project.teams
          };
        }
        return project;
      });
    },
    deleteProject: (state, action: PayloadAction<number>) => {
      state.projects = state.projects.filter(
        (project) => project.id !== action.payload
      );
    },
    addTeamToProject: (state, action: PayloadAction<{ projectId: number; team: Team }>) => {
      const { projectId, team } = action.payload;
      state.projects = state.projects.map((project) => {
        if (project.id === projectId) {
          project.teams.push(team);
        }
        return project;
      });
    },
    removeTeamFromProject: (state, action: PayloadAction<{ projectId: number; teamId: number }>) => {
      const { projectId, teamId } = action.payload;
      state.projects = state.projects.map((project) => {
        if (project.id === projectId) {
          project.teams = project.teams.filter((team) => team.id !== teamId);
        }
        return project;
      });
    },
  },
});

export const { initProjects, addProject, updateProject, deleteProject, addTeamToProject, removeTeamFromProject, setProjectLoading } = projectSlice.actions;
export default projectSlice.reducer;
