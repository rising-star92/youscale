import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { GainCategorieModel } from '../../../models'
import { CLIENT_GAINCATEGORIE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientGainCategorieApi = createApi({
    reducerPath: 'ClientGainCategorieApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_GAINCATEGORIE_URL}),
    endpoints: (builder) =>({
        getClientGainCategorie : builder.query<{code: Number, data:GainCategorieModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addClientGainCategorie : builder.mutation<void, GainCategorieModel>({
            query : (data: GainCategorieModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchClientGainCategorie : builder.mutation<void, GainCategorieModel>({
            query : (data: GainCategorieModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteClientGainCategorie : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientGainCategorieQuery, useAddClientGainCategorieMutation, usePatchClientGainCategorieMutation, useDeleteClientGainCategorieMutation }  = ClientGainCategorieApi;