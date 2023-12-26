import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AddAdminPerteModel } from '../../../models'
import { ADMIN_PERTE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminPerteApi = createApi({
    reducerPath: 'AdminPerteApi',
    baseQuery: fetchBaseQuery({ baseUrl: ADMIN_PERTE_URL }),
    endpoints: (builder) =>({
        
        addAdminPerte : builder.mutation<void, AddAdminPerteModel>({
            query : (data: AddAdminPerteModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminPerte : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAddAdminPerteMutation, useDeleteAdminPerteMutation }  = AdminPerteApi;