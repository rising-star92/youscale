import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { TransactionModel } from '../../../models'
import { CLIENT_TRANSACTION_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientTransactionApi = createApi({
    reducerPath: 'ClientTransactionApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TRANSACTION_URL}),
    endpoints: (builder) =>({
        getClientTransaction : builder.query<{code: Number, data:TransactionModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientTransactionQuery }  = ClientTransactionApi;