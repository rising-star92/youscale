import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { GetProductModel } from '../../../models'
import { CLIENT_TEAM_PRODUCT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientTeamProductApi = createApi({
    reducerPath: 'ClientTeamProductApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TEAM_PRODUCT_URL}),
    endpoints: (builder) =>({
        getClientTeamProduct : builder.query<{code: Number, data:GetProductModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientTeamProductQuery }  = ClientTeamProductApi;