import {createAsyncThunk} from "@reduxjs/toolkit";
import { authService } from "../auth/AuthService";
import { ClientLoginModel, AdminLoginModel, ClientRegisterModel, AdminRegisterModel, ClientOTPModel, ForgotPwdModel } from "../../models";

export const clientLoginThunk = createAsyncThunk(
    'auth/clientlogin',
    async (user:ClientLoginModel, thunkAPI) => {
      console.log(user)
      try {
        return await authService.clientLogin(user);
      } catch (error : any) {
        const message = error.response.data.message || 'Something went wrong try again';
        return thunkAPI.rejectWithValue(message);
      }
    }
);

export const clientTeamLoginThunk = createAsyncThunk(
  'auth/clientteamlogin',
  async (user:ClientLoginModel, thunkAPI) => {
    try {
      return await authService.clientTeamLogin(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const clientOTPVerifyThunk = createAsyncThunk(
  'auth/clientotpverify',
  async (user:ClientOTPModel, thunkAPI) => {
    try {
      return await authService.clientOTPVerify(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resendOTPThunk = createAsyncThunk(
  'auth/resendotp',
  async (user:{ telephone : string }, thunkAPI) => {
    try {
      return await authService.resendCode(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const clientForgotPwdThunk = createAsyncThunk(
  'auth/clientforgotpwd',
  async (user: ForgotPwdModel, thunkAPI) => {
    try {
      return await authService.clientForgotPwd(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const adminLoginThunk = createAsyncThunk(
  'auth/adminlogin',
  async (user:AdminLoginModel, thunkAPI) => {
    try {
      return await authService.adminLogin(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const adminTeamLoginThunk = createAsyncThunk(
  'auth/adminteamlogin',
  async (user:AdminLoginModel, thunkAPI) => {
    try {
      return await authService.adminTeamLogin(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const clientRegisterThunk = createAsyncThunk(
  'auth/adminlogin',
  async (user:ClientRegisterModel, thunkAPI) => {
    try {
      return await authService.clientRegister(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const adminRegisterThunk = createAsyncThunk(
  'auth/adminlogin',
  async (user:AdminRegisterModel, thunkAPI) => {
    try {
      return await authService.adminRegister(user);
    } catch (error : any) {
      const message = error.response.data.message || 'Something went wrong try again';
      return thunkAPI.rejectWithValue(message);
    }
  }
);