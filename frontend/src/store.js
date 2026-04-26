import { configureStore } from '@reduxjs/toolkit';
import uploadReducer from './features/layer1/store/uploadSlice.js';
import authReducer from './features/auth/auth.slice.js';
import fraudReducer from './features/fraud/fraud.slice.js';
import jobsReducer from './features/jobs/jobs.slice.js';

const store = configureStore({
  reducer: {
    upload: uploadReducer,
    auth: authReducer,
    fraud: fraudReducer,
    jobs: jobsReducer,
  },
});

export default store;

