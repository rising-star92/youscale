import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { StatusModel, StatusPatchModel } from '../../../models'
import { ADMIN_STATUS_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminStatusApi = createApi({
    reducerPath: 'AdminStatusApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_STATUS_URL}),
    endpoints: (builder) =>({
        getAdminStatus : builder.query<{code: Number, data:StatusModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminStatus : builder.mutation<void, StatusModel>({
            query : (data: StatusModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminStatus : builder.mutation<void, StatusPatchModel>({
            query : (data: StatusPatchModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminStatus : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminStatusQuery, useAddAdminStatusMutation, usePatchAdminStatusMutation, useDeleteAdminStatusMutation }  = AdminStatusApi;