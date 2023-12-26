import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { DashbordModel, DashbordQueryModel } from '../../../models'
import { CLIENT_DASHBORD_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientDashbordApi = createApi({
    reducerPath: 'ClientDashbordApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_DASHBORD_URL}),
    endpoints: (builder) =>({
        getClientDashbord : builder.query<{code: Number, data:DashbordModel}, DashbordQueryModel>({
            query:(arg) => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        })
    })
})

export const { useGetClientDashbordQuery }  = ClientDashbordApi;