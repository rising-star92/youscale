import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AddPerteModel } from '../../../models'
import { CLIENT_PERTE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientPerteApi = createApi({
    reducerPath: 'ClientPerteApi',
    baseQuery: fetchBaseQuery({ baseUrl: CLIENT_PERTE_URL }),
    endpoints: (builder) =>({
        
        addClientPerte : builder.mutation<void, AddPerteModel>({
            query : (data: AddPerteModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteClientPerte : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAddClientPerteMutation, useDeleteClientPerteMutation }  = ClientPerteApi;