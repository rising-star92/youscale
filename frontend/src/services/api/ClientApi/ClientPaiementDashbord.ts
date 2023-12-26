import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { DashbordPaiementModel, DashbordQueryModel } from '../../../models'
import { CLIENT_PAIEMENT_DASHBORD_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientPaiementDashbordApi = createApi({
    reducerPath: 'ClientPaiementDashbordApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_PAIEMENT_DASHBORD_URL}),
    endpoints: (builder) =>({
        getPaiementDashbord : builder.query<{code: Number, data:DashbordPaiementModel}, DashbordQueryModel>({
            query:(arg) => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        })
    })
})

export const { useGetPaiementDashbordQuery }  = ClientPaiementDashbordApi;