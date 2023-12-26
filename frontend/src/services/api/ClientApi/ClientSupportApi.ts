import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ChatMessage, Support } from '../../../models'
import { CLIENT_SUPPORT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientSupportApi = createApi({
    reducerPath: 'ClientSupportApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_SUPPORT_URL }),
    endpoints: (builder) =>({
        getSupport : builder.query<{code: Number, data:Support[]}, { status?: string }>({
            query:(args) => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
                params: args
            })
        }),
        
        createSupport : builder.mutation<void, Support>({
            query : (data: Support) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        getSupportMessage : builder.query<{code: Number, data:ChatMessage[]}, { id: number }>({
            query:(data: { id: number }) => ({
                method: 'GET',
                url: `/msg/${data.id}`,
                headers: { Authorization: `Bear ${token}` }
            })
        }),

    })
})

export const { useGetSupportQuery, useCreateSupportMutation, useGetSupportMessageQuery }  = ClientSupportApi;