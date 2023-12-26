import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ClientLastPaymentModel } from '../../../models'
import { CLIENT_LASTPAYMENT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientLastPaymentApi = createApi({
    reducerPath: 'ClientLastPaymentApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_LASTPAYMENT_URL}),
    endpoints: (builder) =>({
        getClientLastPayment : builder.query<{code: Number, data: ClientLastPaymentModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientLastPaymentQuery }  = ClientLastPaymentApi;