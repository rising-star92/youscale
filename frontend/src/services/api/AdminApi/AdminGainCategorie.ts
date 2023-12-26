import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { GainCategorieModel } from '../../../models'
import { ADMIN_GAINCATEGORIE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminGainCategorieApi = createApi({
    reducerPath: 'AdminGainCategorieApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_GAINCATEGORIE_URL}),
    endpoints: (builder) =>({
        getAdminGainCategorie : builder.query<{code: Number, data:GainCategorieModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminGainCategorie : builder.mutation<void, GainCategorieModel>({
            query : (data: GainCategorieModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminGainCategorie : builder.mutation<void, GainCategorieModel>({
            query : (data: GainCategorieModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminGainCategorie : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminGainCategorieQuery, useAddAdminGainCategorieMutation, usePatchAdminGainCategorieMutation, useDeleteAdminGainCategorieMutation }  = AdminGainCategorieApi;