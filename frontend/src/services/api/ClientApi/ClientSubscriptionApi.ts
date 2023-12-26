import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ChangeSubscriptionModel } from '../../../models'
import { CLIENT_SUBSCRIPTION_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientSubscriptionApi = createApi({
    reducerPath: 'ClientSubscriptionApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_SUBSCRIPTION_URL}),
    endpoints: (builder) =>({
        changeSubscription : builder.mutation<void, ChangeSubscriptionModel>({
            query : (data: ChangeSubscriptionModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useChangeSubscriptionMutation }  = ClientSubscriptionApi;