import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { PerteCategorieModel } from '../../../models'
import { ADMIN_PERTECATEGORIE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminPerteCategorieApi = createApi({
    reducerPath: 'AdminPerteCategorieApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_PERTECATEGORIE_URL}),
    endpoints: (builder) =>({
        getAdminPerteCategorie : builder.query<{code: Number, data:PerteCategorieModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminPerteCategorie : builder.mutation<void, PerteCategorieModel>({
            query : (data: PerteCategorieModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminPerteCategorie : builder.mutation<void, PerteCategorieModel>({
            query : (data: PerteCategorieModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminPerteCategorie : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminPerteCategorieQuery, useAddAdminPerteCategorieMutation, usePatchAdminPerteCategorieMutation, useDeleteAdminPerteCategorieMutation }  = AdminPerteCategorieApi;