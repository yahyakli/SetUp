import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Invitation } from "@/types/index";
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
export const addInvitation = createAction<Invitation>('invitations/addInvitation');
export const updateInvitation = createAction<Invitation>('invitations/updateInvitation');

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
      state.invitations = state.invitations.filter(inv => inv._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addInvitation, (state, action) => {
        // Check if invitation already exists to avoid duplicates
        const exists = state.invitations.some(inv => inv._id === action.payload._id);
        if (!exists) {
          state.invitations.unshift(action.payload);
        }
      })
      .addCase(updateInvitation, (state, action) => {
        const index = state.invitations.findIndex(inv => inv._id === action.payload._id);
        if (index !== -1) {
          state.invitations[index] = action.payload;
        }
      });
  }
});

export const { setInvitationLoading, initInvitations, deleteInvi } = invitationSlice.actions;
export default invitationSlice.reducer;
