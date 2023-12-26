import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminBankInformationModel } from '../../../models'
import { CLIENT_ADMINBANK_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientBankAdminApi = createApi({
    reducerPath: 'ClientBankAdminApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_ADMINBANK_URL}),
    endpoints: (builder) =>({
        getClientBankAdmin : builder.query<{code: Number, data:AdminBankInformationModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientBankAdminQuery }  = ClientBankAdminApi;