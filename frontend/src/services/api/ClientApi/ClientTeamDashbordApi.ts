import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { TeamDashbordModel, TeamDashbordQueryModel } from '../../../models'
import { CLIENT_TEAM_DASHBORD_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientTeamDashbordApi = createApi({
    reducerPath: 'ClientTeamDashbordApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TEAM_DASHBORD_URL}),
    endpoints: (builder) =>({
        getTeamDashbord : builder.query<{code: Number, data:TeamDashbordModel}, TeamDashbordQueryModel>({
            query:(arg) => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        })
    })
})

export const { useGetTeamDashbordQuery }  = ClientTeamDashbordApi;