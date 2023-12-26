import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { PatchSettingModel, GetSettingModel } from '../../../models'
import { CLIENT_SETTING_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientSettingApi = createApi({
    reducerPath: 'ClientSettingApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_SETTING_URL}),
    endpoints: (builder) =>({
        getSetting : builder.query<{code: Number, data:GetSettingModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchSetting : builder.mutation<void, PatchSettingModel>({
            query : (data: PatchSettingModel) => ({
                method : 'PATCH',
                url : `/`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),
    })
})

export const { useGetSettingQuery, usePatchSettingMutation }  = ClientSettingApi;