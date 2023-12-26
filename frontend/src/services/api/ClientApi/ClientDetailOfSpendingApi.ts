import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { DetailsOfSpendingModel } from '../../../models'
import { CLIENT_DETAILSOFSPENDING_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientDetailOfSpendingApi = createApi({
    reducerPath: 'ClientDetailOfSpendingApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_DETAILSOFSPENDING_URL}),
    endpoints: (builder) =>({
        getDetailOfSpending : builder.query<{code: Number, data:DetailsOfSpendingModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetDetailOfSpendingQuery }  = ClientDetailOfSpendingApi;