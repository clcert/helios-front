import { createSlice } from "@reduxjs/toolkit";

const electionSlice = createSlice({
  name: "election",
  initialState: {
    actualElection: {},
    elections: [],
    totalVoters: 0,
    totalTrustees: 0,
  },
  reducers: {
    setElection: (state, action) => {
      state.actualElection = { ...action.payload };
    },
    setElections: (state, action) => {
      state.elections = [...action.payload];
    },
    setTotalVoters: (state, action) => {
      state.totalVoters = action.payload;
    },
    setTotalTrustees: (state, action) => {
      state.totalTrustees = action.payload
    }
  },
});

export const { setElection, setElections, setTotalVoters, setTotalTrustees } = electionSlice.actions;
export default electionSlice.reducer;
