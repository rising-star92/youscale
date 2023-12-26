import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AddGainModel } from '../../../models'
import { CLIENT_GAIN_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientGainApi = createApi({
    reducerPath: 'ClientGainApi',
    baseQuery: fetchBaseQuery({ baseUrl: CLIENT_GAIN_URL }),
    endpoints: (builder) =>({
        
        addClientGain : builder.mutation<void, AddGainModel>({
            query : (data: AddGainModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteClientGain : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAddClientGainMutation, useDeleteClientGainMutation }  = ClientGainApi;