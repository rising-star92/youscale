import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminGetClientModel, ClientRegisterModel } from '../../../models'
import { ADMIN_CLIENT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminClientApi = createApi({
    reducerPath: 'AdminClientApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_CLIENT_URL}),
    endpoints: (builder) =>({
        getAdminClient : builder.query<{code: Number, data:AdminGetClientModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        addAdminClient : builder.mutation<void, ClientRegisterModel>({
            query : (data: ClientRegisterModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),
    })
})

export const { useGetAdminClientQuery, useAddAdminClientMutation }  = AdminClientApi;