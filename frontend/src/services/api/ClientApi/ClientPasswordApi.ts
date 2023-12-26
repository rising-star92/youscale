import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ResetPasswordModel } from '../../../models'
import { CLIENT_PASSWORD_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientPasswordApi = createApi({
    reducerPath: 'ClientPasswordApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_PASSWORD_URL}),
    endpoints: (builder) =>({
        resetClientPassword : builder.mutation<void, ResetPasswordModel>({
            query : (data: ResetPasswordModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useResetClientPasswordMutation }  = ClientPasswordApi;