import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminAdsModel } from '../../../models'
import { ADMIN_ADS_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminAdsApi = createApi({
    reducerPath: 'AdminAdsApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_ADS_URL}),
    endpoints: (builder) =>({
        addAdminAdsCategorie : builder.mutation<void, AdminAdsModel>({
            query : (data: AdminAdsModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAddAdminAdsCategorieMutation }  = AdminAdsApi;