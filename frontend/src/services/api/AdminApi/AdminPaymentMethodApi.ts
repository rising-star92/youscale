import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminPaymentMethodModel } from '../../../models'
import { ADMIN_PAYMENTMETHOD_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminPaymentMethodApi = createApi({
    reducerPath: 'AdminPaymentMethodApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_PAYMENTMETHOD_URL}),
    endpoints: (builder) =>({
        getAdminPaymentMethod : builder.query<{code: Number, data:AdminPaymentMethodModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminPaymentMethod : builder.mutation<void, AdminPaymentMethodModel>({
            query : (data: AdminPaymentMethodModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminPaymentMethod : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminPaymentMethodQuery, useAddAdminPaymentMethodMutation, useDeleteAdminPaymentMethodMutation }  = AdminPaymentMethodApi;