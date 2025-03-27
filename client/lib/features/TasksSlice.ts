import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "@/types";

// Define the initial state
interface TasksState {
  tasks: Task[];
  taskLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  taskLoading: false,
  error: null,
};


// Create slice
const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTaskLoading: (state, action: PayloadAction<boolean>) => {
      state.taskLoading = action.payload;
    },
    initTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((task) => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);
    }
  },
});

export const { setTaskLoading, initTasks, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;
