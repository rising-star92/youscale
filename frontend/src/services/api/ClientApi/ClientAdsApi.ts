import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminAdsModel } from '../../../models'
import { CLIENT_ADS_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientAdsApi = createApi({
    reducerPath: 'ClientAdsApi',
    baseQuery: fetchBaseQuery({ baseUrl: CLIENT_ADS_URL }),
    endpoints: (builder) =>({
        getAds : builder.query<{code: Number, data:AdminAdsModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdsQuery }  = ClientAdsApi;