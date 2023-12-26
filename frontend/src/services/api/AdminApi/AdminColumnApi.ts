import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ColumnModel, ColumnPatchModel } from '../../../models'
import { ADMIN_COLUMN_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')
export const AdminColumnApi = createApi({
    reducerPath: 'AdminColumnApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_COLUMN_URL}),
    endpoints: (builder) =>({
        getAdminColumn : builder.query<{code: Number, data:ColumnModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminColumn : builder.mutation<void, ColumnPatchModel>({
            query : (data: ColumnPatchModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

    })
})

export const { useGetAdminColumnQuery, usePatchAdminColumnMutation }  = AdminColumnApi;