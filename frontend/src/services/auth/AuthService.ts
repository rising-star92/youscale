import { setToken } from "./setToken";
import { setUserData } from "./setUserData";
import { ClientLoginModel, AdminLoginModel, ClientRegisterModel, AdminRegisterModel, ClientOTPModel, ForgotPwdModel } from "../../models";
import { CLIENT_LOGIN_URL, CLIENT_REGISTER_URL, ADMIN_LOGIN_URL, ADMIN_REGISTER_URL, ADMIN_TEAM_LOGIN_URL, CLIENT_TEAM_LOGIN_URL, CLIENT_OTP_URL, CLIENT_FORGET_PASSWORD_URL, RESEND_OTP_URL } from "../url/API_URL";
import axios from "axios";

export const authService = {
    clientLogin: async (user: ClientLoginModel) => {
        const response = await axios.post(CLIENT_LOGIN_URL, user);
        
        if (response.data) {
            if(response.data.client.active){
                setToken(response.data.token)
                setUserData(response.data.client)
            }else{
                localStorage.setItem('telephone', JSON.stringify(response.data.client.telephone))
            }
        }
        
        return response.data;
    },

    clientTeamLogin: async (user: ClientLoginModel) => {
        const response = await axios.post(CLIENT_TEAM_LOGIN_URL, user);
        
        if (response.data) {
            setToken(response.data.token)
            setUserData(response.data.teamUser)
        }
        
        return response.data;
    },

    clientRegister: async (user: ClientRegisterModel) => {
        const response = await axios.post(CLIENT_REGISTER_URL, user);
        
        if (response.data) {
            if(response.data.client.active){
                setToken(response.data.token)
                setUserData(response.data.client)
            }else{
                localStorage.setItem('telephone', JSON.stringify(response.data.client.telephone))
            }
        }
        
        return response.data;
    },

    clientOTPVerify: async (user: ClientOTPModel) => {
        const response = await axios.post(CLIENT_OTP_URL, user);
        
        if (response.data) {
            if(response.data.client.active){
                setToken(response.data.token)
                setUserData(response.data.client)
            }
        }
        
        return response.data;
    },

    resendCode: async (data: { telephone : string }) => {
        const response = await axios.post(RESEND_OTP_URL, data);
        
        return response.data;
    },

    clientForgotPwd : async (user: ForgotPwdModel) => {
        const response = await axios.post(CLIENT_FORGET_PASSWORD_URL, user);
        
        return response.data;
    },

    adminLogin: async (user: AdminLoginModel) => {
        const response = await axios.post(ADMIN_LOGIN_URL, user);
        
        if (response.data) {
            setUserData(response.data.admin)
            setToken(response.data.token)
        }
        
        return response.data;
    },

    adminRegister: async (user: AdminRegisterModel) => {
        const response = await axios.post(ADMIN_REGISTER_URL, user);
        
        if (response.data) {
            setUserData(response.data.admin)
            setToken(response.data.token)
        }
        
        return response.data;
    },

    adminTeamLogin: async (user: AdminLoginModel) => {
        const response = await axios.post(ADMIN_TEAM_LOGIN_URL, user);
        
        if (response.data) {
            setUserData(response.data.teamAdmin)
            setToken(response.data.token)
        }
        
        return response.data;
    },

    logout: async () => {
        setToken('')
    },
}