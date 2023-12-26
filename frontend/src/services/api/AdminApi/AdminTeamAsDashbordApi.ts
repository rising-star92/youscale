import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { GetTeamMemberAsDashbordModel } from '../../../models'
import { ADMIN_TEAMMEMBERASDAH_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminTeamAsDashbordApi = createApi({
    reducerPath: 'AdminTeamAsDashbordApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_TEAMMEMBERASDAH_URL}),
    endpoints: (builder) =>({
        getTeamAsDashbord : builder.query<{code: Number, data:GetTeamMemberAsDashbordModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetTeamAsDashbordQuery }  = AdminTeamAsDashbordApi;