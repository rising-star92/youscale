import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { useCouponModel } from '../../../models'
import { CLIENT_COUPON_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientCouponApi = createApi({
    reducerPath: 'ClientCouponApi',
    baseQuery: fetchBaseQuery({ baseUrl: CLIENT_COUPON_URL }),
    endpoints: (builder) =>({
        
        Coupon : builder.mutation<void, useCouponModel>({
            query : (data: useCouponModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useCouponMutation }  = ClientCouponApi;