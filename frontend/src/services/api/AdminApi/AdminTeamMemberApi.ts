import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminTeamMemberModel, GetAdminTeamMemberModel } from '../../../models'
import { ADMIN_TEAMMEMBER_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminTeamMemberApi = createApi({
    reducerPath: 'AdminTeamMemberApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_TEAMMEMBER_URL}),
    endpoints: (builder) =>({
        getAdminTeamMember : builder.query<{code: Number, data:GetAdminTeamMemberModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminTeamMember : builder.mutation<void, AdminTeamMemberModel>({
            query : (data: AdminTeamMemberModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminTeamMember : builder.mutation<void, GetAdminTeamMemberModel>({
            query : (data: GetAdminTeamMemberModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminTeamMember : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminTeamMemberQuery, useAddAdminTeamMemberMutation, usePatchAdminTeamMemberMutation, useDeleteAdminTeamMemberMutation }  = AdminTeamMemberApi;