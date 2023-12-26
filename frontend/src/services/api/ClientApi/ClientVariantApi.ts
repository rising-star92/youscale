import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { VariantModel } from '../../../models'
import { CLIENT_VARIANT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientVariantApi = createApi({
    reducerPath: 'ClientVariantApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_VARIANT_URL}),
    endpoints: (builder) =>({
        getVariant : builder.query<{code: Number, data:VariantModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addVariant : builder.mutation<void, VariantModel>({
            query : (data: VariantModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchVariant : builder.mutation<void, VariantModel>({
            query : (data: VariantModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteVariant : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetVariantQuery, useAddVariantMutation, usePatchVariantMutation, useDeleteVariantMutation }  = ClientVariantApi;