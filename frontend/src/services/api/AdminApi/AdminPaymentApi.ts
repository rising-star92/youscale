import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { PaymentModel } from '../../../models'
import { ADMIN_PAYMENT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminPaymentApi = createApi({
    reducerPath: 'AdminPaymentApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_PAYMENT_URL}),
    endpoints: (builder) =>({
        getClientPayment : builder.query<{code: Number, data:PaymentModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        acceptClientPayment : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'POST',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        declineClientPayment : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientPaymentQuery, useAcceptClientPaymentMutation, useDeclineClientPaymentMutation }  = AdminPaymentApi;