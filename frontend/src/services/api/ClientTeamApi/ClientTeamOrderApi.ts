import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ClientOrderModel, GetClientOrderModel } from '../../../models'
import { CLIENT_TEAM_ORDER_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientTeamOrderApi = createApi({
    reducerPath: 'ClientTeamOrderApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TEAM_ORDER_URL}),
    endpoints: (builder) =>({
        getClientTeamOrder : builder.query<{code: Number, data:GetClientOrderModel[], order: {id: number, id_city: number, id_team: number, createdAt: Date}[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addClientTeamOrder : builder.mutation<void, ClientOrderModel>({
            query : (data: ClientOrderModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientTeamOrderQuery, useAddClientTeamOrderMutation }  = ClientTeamOrderApi;