import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminReferenceModel } from '../../../models'
import { ADMIN_RELOADCLIENTACCOUNT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminReloadClientAccountApi = createApi({
    reducerPath: 'AdminReloadClientAccountApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_RELOADCLIENTACCOUNT_URL}),
    endpoints: (builder) =>({

        refundClientAccount : builder.mutation<void, AdminReferenceModel>({
            query : (data: AdminReferenceModel) => ({
                method : 'POST',
                url : `/`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

    })
})

export const { useRefundClientAccountMutation }  = AdminReloadClientAccountApi;