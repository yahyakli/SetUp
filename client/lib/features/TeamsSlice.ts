import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Team } from "@/types";
import { createAction } from "@reduxjs/toolkit";

// Define the initial state
interface TeamsState {
  teams: Team[];
  teamLoading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  teamLoading: false,
  error: null,
};


// Create slice
const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setTeamsLoading: (state, action: PayloadAction<boolean>) => {
      state.teamLoading = action.payload;
    },
    initTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
    },
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push(action.payload);
    },
    updateTeamInState: (state, action: PayloadAction<Team>) => {
      const index = state.teams.findIndex((team) => team.id === action.payload.id);
      if (index !== -1) {
        state.teams[index] = action.payload;
      }
    },
    deleteTeamInState: (state, action: PayloadAction<string>) => {
      state.teams = state.teams.filter((team) => team.id !== action.payload);
    },
  },
});

export const { addTeam, updateTeamInState, deleteTeamInState, initTeams, setTeamsLoading } = teamSlice.actions;
export default teamSlice.reducer;
