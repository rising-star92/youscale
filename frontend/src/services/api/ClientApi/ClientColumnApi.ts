import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ColumnModel, ColumnPatchModel } from '../../../models'
import { CLIENT_COLUMN_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientColumnApi = createApi({
    reducerPath: 'ClientColumnApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_COLUMN_URL}),
    endpoints: (builder) =>({
        getColumn : builder.query<{code: Number, data:ColumnModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addColumn : builder.mutation<void, ColumnModel>({
            query : (data: ColumnModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchColumn : builder.mutation<void, ColumnPatchModel>({
            query : (data: ColumnPatchModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteColumn : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetColumnQuery, useAddColumnMutation, usePatchColumnMutation, useDeleteColumnMutation }  = ClientColumnApi;