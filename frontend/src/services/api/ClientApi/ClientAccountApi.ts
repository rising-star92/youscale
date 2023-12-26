import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ClientAccountModel } from '../../../models'
import { CLIENT_ACCOUNT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientAccountApi = createApi({
    reducerPath: 'ClientAccountApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_ACCOUNT_URL}),
    endpoints: (builder) =>({
        getClientAccount : builder.query<{code: Number, data: ClientAccountModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientAccountQuery }  = ClientAccountApi;