import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ADMIN_TEAM_PAGE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')
export const AdminTeamPageApi = createApi({
    reducerPath: 'AdminTeamPageApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_TEAM_PAGE_URL}),
    endpoints: (builder) =>({
        getTeamMemberPage : builder.query<{code: Number, data:string[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetTeamMemberPageQuery }  = AdminTeamPageApi;