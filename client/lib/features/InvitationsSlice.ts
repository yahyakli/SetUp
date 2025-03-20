import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Invitation } from "@/types";
import { createAction } from "@reduxjs/toolkit";

// Define the initial state
interface InvitationsState {
  invitations: Invitation[];
  invitationLoading: boolean;
  error: string | null;
}

const initialState: InvitationsState = {
  invitations: [],
  invitationLoading: false,
  error: null,
};

// Add these action creators if they don't exist
export const removeInvitation = createAction<string>('invitations/remove');

// Create slice
const invitationSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {
    setInvitationLoading: (state, action: PayloadAction<boolean>) => {
      state.invitationLoading = action.payload;
    },
    initInvitations: (state, action: PayloadAction<Invitation[]>) => {
      state.invitations = action.payload;
    },
    deleteInvi: (state, action: PayloadAction<string>) => {
      state.invitations = state.invitations.filter(inv => inv.token !== action.payload);
    },
  },
});

export const { setInvitationLoading, initInvitations, deleteInvi } = invitationSlice.actions;
export default invitationSlice.reducer;
