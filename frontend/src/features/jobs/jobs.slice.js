import { createSlice } from '@reduxjs/toolkit';

/**
 * jobs: { [jobId]: { jobId, status, data?, error? } }
 *
 * Populated exclusively via socket "job_update" events.
 * Each `upsertJob` call merges the incoming payload into the existing entry so
 * earlier fields (e.g. jobId) are never overwritten by a later partial update.
 */
const initialState = {
  jobs: {},
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    upsertJob(state, action) {
      const { jobId } = action.payload;
      if (!jobId) return;
      state.jobs[jobId] = {
        ...(state.jobs[jobId] ?? {}),
        ...action.payload,
      };
    },
    clearJobs(state) {
      state.jobs = {};
    },
  },
});

export const { upsertJob, clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;
