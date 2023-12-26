import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ShippingModel } from '../../../models'
import { CLIENT_SHIPPING_COMPANIE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')
export const ClientShippingApi = createApi({
    reducerPath: 'ClientShippingApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_SHIPPING_COMPANIE_URL}),
    endpoints: (builder) =>({
        getShipping : builder.query<{code: Number, data: ShippingModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetShippingQuery }  = ClientShippingApi;