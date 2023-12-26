import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ClientGetPackModel, Pack } from '../../../models'
import { CLIENT_PACK_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientPackApi = createApi({
    reducerPath: 'ClientPackApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_PACK_URL}),
    endpoints: (builder) =>({
        getClientPack : builder.query<{code: Number, data: ClientGetPackModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        getClientAllPack : builder.query<{code: Number, data: Pack[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/all'
            })
        })
    })
})

export const { useGetClientPackQuery, useGetClientAllPackQuery }  = ClientPackApi;