import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CLIENT_TEAM_PAGE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')
export const ClientTeamPageApi = createApi({
    reducerPath: 'ClientTeamPageApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TEAM_PAGE_URL}),
    endpoints: (builder) =>({
        getClientTeamMemberPage : builder.query<{code: Number, data:string[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientTeamMemberPageQuery }  = ClientTeamPageApi;