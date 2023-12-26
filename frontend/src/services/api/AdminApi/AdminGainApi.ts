import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AddAdminGainModel } from '../../../models'
import { ADMIN_GAIN_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminGainApi = createApi({
    reducerPath: 'AdminGainApi',
    baseQuery: fetchBaseQuery({ baseUrl: ADMIN_GAIN_URL }),
    endpoints: (builder) =>({
        
        addAdminGain : builder.mutation<void, AddAdminGainModel>({
            query : (data: AddAdminGainModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminGain : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAddAdminGainMutation, useDeleteAdminGainMutation }  = AdminGainApi;