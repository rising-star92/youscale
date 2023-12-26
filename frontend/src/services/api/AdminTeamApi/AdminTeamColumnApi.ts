import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ADMIN_TEAM_COLUMN_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')
export const AdminTeamColumnApi = createApi({
    reducerPath: 'AdminTeamColumnApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_TEAM_COLUMN_URL}),
    endpoints: (builder) =>({
        getTeamMemberColumn : builder.query<{code: Number, data:string[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetTeamMemberColumnQuery }  = AdminTeamColumnApi;