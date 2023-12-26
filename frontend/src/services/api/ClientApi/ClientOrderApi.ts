import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ClientOrderModel, GetClientOrderModel, PatchClientOrderModel, ProductOrder, OrderQueryModel, OrderOnlyModel } from '../../../models'
import { CLIENT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientOrderApi = createApi({
    reducerPath: 'ClientOrderApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_URL}),
    endpoints: (builder) =>({
        getClientOrder : builder.query<{code: Number, data:GetClientOrderModel[], order: {id: number, id_city: number, id_team: number, Product_Orders: ProductOrder[], createdAt: Date, SheetId: string, reportedDate: string, isSendLivo: string, telDuplicate: boolean}[]}, OrderQueryModel>({
            query:(arg) => ({
                method: 'GET',
                url: 'order/',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        }),

        getClientOrderById : builder.query<{code: Number, data:GetClientOrderModel, order: OrderOnlyModel[]}, { id: number }>({
            query:(arg) => ({
                method: 'GET',
                url: 'order/byid',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        }),

        getAllOrderId : builder.query<{ code: Number, data: number[] }, void>({
            query:() => ({
                method: 'GET',
                url: '/getallid',
                headers: { Authorization: `Bear ${token}` }
            })
        }),

        getSheetOrder : builder.query<{}, void>({
            query:() => ({
                method: 'GET',
                url: 'order/sheet',
                headers: { Authorization: `Bear ${token}` }
            })
        }),
        
        addClientOrder : builder.mutation<void, ClientOrderModel>({
            query : (data: ClientOrderModel) => ({
                method : 'POST',
                url : 'order/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchClientOrder : builder.mutation<void, PatchClientOrderModel>({
            query : (data: PatchClientOrderModel) => ({
                method : 'PATCH',
                url : `order/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteClientOrder : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `order/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        bulkDeleteClientOrder : builder.mutation<void, {id_orders : number[]}>({
            query : (data: {id_orders : number[]}) => ({
                method : 'DELETE',
                body : data,
                url : `bulk/order`,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        bulkEditClientOrder : builder.mutation<void, {new_id_team: number, id_orders : number[]}>({
            query : (data: {new_id_team: number, id_orders : number[]}) => ({
                method : 'POST',
                body : data,
                url : `bulk/edit`,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        getClientOrderExportModel : builder.query<{code: Number, data:{}[], header: {label: string, key: string}[]}, {id_orders: string}>({
            query:(arg) => ({
                method: 'GET',
                url: 'order/export',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        }),

        getOrderHistory : builder.query<{code: Number, data:{message: string, createdAt: string}[]}, {id_order: string}>({
            query:(arg) => ({
                method: 'GET',
                url: 'order/history',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        }),

        getOrderComment : builder.query<{code: Number, data:{message: string, createdAt: string}[]}, {id_order: string}>({
            query:(arg) => ({
                method: 'GET',
                url: 'order/comment',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        }),

        makeOrderComment : builder.mutation<void, {message: string, id_order : number}>({
            query : (data:  { message: string, id_order : number }) => ({
                method : 'POST',
                body : data,
                url : `order/comment`,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

    })
})

export const { 
    useAddClientOrderMutation, useGetClientOrderQuery, 
    useDeleteClientOrderMutation, usePatchClientOrderMutation, 
    useGetClientOrderExportModelQuery, useGetSheetOrderQuery, 
    useGetOrderHistoryQuery, useBulkDeleteClientOrderMutation,
    useBulkEditClientOrderMutation, useGetClientOrderByIdQuery,
    useGetAllOrderIdQuery, useGetOrderCommentQuery, useMakeOrderCommentMutation
}  = ClientOrderApi;