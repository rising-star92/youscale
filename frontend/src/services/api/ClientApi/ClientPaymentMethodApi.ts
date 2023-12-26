import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminPaymentMethodModel } from '../../../models'
import { CLIENT_PAYMENTMETHOD_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientPaymentMethodApi = createApi({
    reducerPath: 'ClientPaymentMethodApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_PAYMENTMETHOD_URL}),
    endpoints: (builder) =>({
        getClientPaymentMethod : builder.query<{code: Number, data:AdminPaymentMethodModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientPaymentMethodQuery }  = ClientPaymentMethodApi;