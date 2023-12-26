import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CountOrderModel } from '../../../models'
import { CLIENT_ORDER_NEW_COUNT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientCountNewOrderApi = createApi({
    reducerPath: 'ClientCountNewOrderApi',
    baseQuery: fetchBaseQuery({ baseUrl: CLIENT_ORDER_NEW_COUNT_URL }),
    endpoints: (builder) =>({
        getCountNewOrder : builder.query<{code: Number, data:CountOrderModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetCountNewOrderQuery }  = ClientCountNewOrderApi;