import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ProductModel, GetProductModel } from '../../../models'
import { CLIENT_PRODUIT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientProductApi = createApi({
    reducerPath: 'ClientProduitApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_PRODUIT_URL}),
    endpoints: (builder) =>({
        getProduct : builder.query<{code: Number, data:GetProductModel[]}, {isHidden : boolean}>({
            query:(arg) => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        }),
        
        addProduct : builder.mutation<void, ProductModel>({
            query : (data: ProductModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchProduct : builder.mutation<void, ProductModel>({
            query : (data: ProductModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteProduct : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetProductQuery, useAddProductMutation, usePatchProductMutation, useDeleteProductMutation  }  = ClientProductApi;