import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminDetailsOfSpendingModel } from '../../../models'
import { ADMIN_DETAILSOFSPENDING_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminDetailOfSpendingApi = createApi({
    reducerPath: 'AdminDetailOfSpendingApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_DETAILSOFSPENDING_URL}),
    endpoints: (builder) =>({
        adminGetDetailOfSpending : builder.query<{code: Number, data:AdminDetailsOfSpendingModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAdminGetDetailOfSpendingQuery }  = AdminDetailOfSpendingApi;