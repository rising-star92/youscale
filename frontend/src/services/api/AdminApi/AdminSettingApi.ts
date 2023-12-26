import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminSettingModel, AdminPatchSettingModel } from '../../../models'
import { ADMIN_SETTING_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminSettingApi = createApi({
    reducerPath: 'AdminSettingApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_SETTING_URL}),
    endpoints: (builder) =>({
        getAdminSetting : builder.query<{code: Number, data:AdminSettingModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminSetting : builder.mutation<void, AdminSettingModel>({
            query : (data: AdminSettingModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminSetting : builder.mutation<void, AdminPatchSettingModel>({
            query : (data: AdminPatchSettingModel) => ({
                method : 'PATCH',
                url : `/`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteAdminSetting : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminSettingQuery, useAddAdminSettingMutation, usePatchAdminSettingMutation, useDeleteAdminSettingMutation }  = AdminSettingApi;