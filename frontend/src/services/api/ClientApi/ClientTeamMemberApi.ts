import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { TeamMemberModel, GetTeamMemberModel } from '../../../models'
import { CLIENT_TEAMMEMBER_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientTeamMemberApi = createApi({
    reducerPath: 'ClientTeamMemmberApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TEAMMEMBER_URL}),
    endpoints: (builder) =>({
        getTeamMember : builder.query<{code: Number, data:GetTeamMemberModel[]}, {isHidden? : boolean}>({
            query:(arg) => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
                params: arg
            })
        }),
        
        addTeamMember : builder.mutation<void, TeamMemberModel>({
            query : (data: TeamMemberModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchTeamMember : builder.mutation<void, GetTeamMemberModel>({
            query : (data: GetTeamMemberModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteTeamMember : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetTeamMemberQuery, useAddTeamMemberMutation, usePatchTeamMemberMutation, useDeleteTeamMemberMutation }  = ClientTeamMemberApi;