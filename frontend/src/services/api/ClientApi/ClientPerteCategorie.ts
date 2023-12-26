import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { PerteCategorieModel } from '../../../models'
import { CLIENT_PERTECATEGORIE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientPerteCategorieApi = createApi({
    reducerPath: 'ClientPerteCategorieApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_PERTECATEGORIE_URL}),
    endpoints: (builder) =>({
        getClientPerteCategorie : builder.query<{code: Number, data:PerteCategorieModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addClientPerteCategorie : builder.mutation<void, PerteCategorieModel>({
            query : (data: PerteCategorieModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchClientPerteCategorie : builder.mutation<void, PerteCategorieModel>({
            query : (data: PerteCategorieModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteClientPerteCategorie : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientPerteCategorieQuery, useAddClientPerteCategorieMutation, usePatchClientPerteCategorieMutation, useDeleteClientPerteCategorieMutation }  = ClientPerteCategorieApi;