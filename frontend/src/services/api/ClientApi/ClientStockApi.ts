import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { StockModel, GetStockModel } from '../../../models'
import { CLIENT_STOCK_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientStockApi = createApi({
    reducerPath: 'ClientStockApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_STOCK_URL}),
    endpoints: (builder) =>({
        getStock : builder.query<{code: Number, data:GetStockModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addStock : builder.mutation<void, StockModel>({
            query : (data: StockModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchStock : builder.mutation<void, StockModel>({
            query : (data: StockModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteStock : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetStockQuery, useAddStockMutation, usePatchStockMutation, useDeleteStockMutation }  = ClientStockApi;