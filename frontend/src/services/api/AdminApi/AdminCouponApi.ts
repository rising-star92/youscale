import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminCouponModel } from '../../../models'
import { ADMIN_COUPON_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminCouponApi = createApi({
    reducerPath: 'AdminCouponApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_COUPON_URL}),
    endpoints: (builder) =>({
        getAdminCoupon : builder.query<{code: Number, data:AdminCouponModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminCoupon : builder.mutation<void, AdminCouponModel>({
            query : (data: AdminCouponModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminCoupon : builder.mutation<void, AdminCouponModel>({
            query : (data: AdminCouponModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminCoupon : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminCouponQuery, useAddAdminCouponMutation, usePatchAdminCouponMutation, useDeleteAdminCouponMutation }  = AdminCouponApi;