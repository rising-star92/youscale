import {createSlice, Slice} from "@reduxjs/toolkit";
import { isRejected, isPending, isFulfilled } from '@reduxjs/toolkit';
import { clientLoginThunk, clientRegisterThunk, adminLoginThunk, adminRegisterThunk, adminTeamLoginThunk, clientTeamLoginThunk, clientOTPVerifyThunk } from "../thunks/authThunks";

const initialState = {
    isAuthenticated: false,
    isVerified: null,
    isLoading: false,
    step: '',
    isError: false,
    message: ''
};

const rejectionReducer = (state:any, action:any) => {
    state.isLoading = false;
    state.isError = true;
    state.message = String(action.payload);
}

const pendingReducer = (state:any, action:any) => {
    state.isLoading = true;
}

const fulfilledReducer = (state:any, action:any) => {
    const verified = action.payload.client?.active | action.payload.teamUser?.active
    const step = action.payload.client?.step

    localStorage.setItem('STEP', !verified ? JSON.stringify('NOT_VERIFIED') : step ? JSON.stringify(step) : JSON.stringify('completed'))

    state.isLoading = false;
    state.step = step;
    state.isAuthenticated = verified;
    state.isVerified = Boolean(verified);

    if(!verified) state.message = 'Vous devez vérifier votre contact';
}

export const authSlice: Slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isAuthenticated = false;
            state.isLoading = false;
            state.isError = false;
            state.message = '';
            state.step = '';
        },
    },

    extraReducers: (builder) => {
        builder.addMatcher(
            isRejected(clientLoginThunk, clientRegisterThunk, adminLoginThunk, adminRegisterThunk, adminTeamLoginThunk, clientTeamLoginThunk, clientOTPVerifyThunk),rejectionReducer
        )
      
        builder.addMatcher(
            isPending(clientLoginThunk, clientRegisterThunk, adminLoginThunk, adminRegisterThunk, adminTeamLoginThunk, clientTeamLoginThunk, clientOTPVerifyThunk),pendingReducer
        )

        builder.addMatcher(
            isFulfilled(clientLoginThunk, clientRegisterThunk, adminLoginThunk, adminRegisterThunk, adminTeamLoginThunk, clientTeamLoginThunk, clientOTPVerifyThunk),fulfilledReducer
        )
    }
});

export const { reset } = authSlice.actions;
export const selectAuth = (state: any) => state.auth;
export default authSlice.reducer;