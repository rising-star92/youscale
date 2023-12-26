import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminTransactionModel } from '../../../models'
import { ADMIN_TRANSACTION_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminTransactionApi = createApi({
    reducerPath: 'AdminTransactionApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_TRANSACTION_URL}),
    endpoints: (builder) =>({
        adminGetAdminTransaction : builder.query<{code: Number, data:AdminTransactionModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAdminGetAdminTransactionQuery }  = AdminTransactionApi;