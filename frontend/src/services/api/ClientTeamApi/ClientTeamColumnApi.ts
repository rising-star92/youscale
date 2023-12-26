import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CLIENT_TEAM_COLUMN_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')
export const ClientTeamColumnApi = createApi({
    reducerPath: 'ClientTeamColumnApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TEAM_COLUMN_URL}),
    endpoints: (builder) =>({
        getClientTeamMemberColumn : builder.query<{code: Number, data:string[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientTeamMemberColumnQuery }  = ClientTeamColumnApi;