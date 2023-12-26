import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminBankInformationModel } from '../../../models'
import { ADMIN_BANKINFORMATION_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminBankInformationApi = createApi({
    reducerPath: 'AdminBankInformationApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_BANKINFORMATION_URL}),
    endpoints: (builder) =>({
        getAdminBankInformation : builder.query<{code: Number, data:AdminBankInformationModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addAdminBankInformation : builder.mutation<void, AdminBankInformationModel>({
            query : (data: AdminBankInformationModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchAdminBankInformation : builder.mutation<void, AdminBankInformationModel>({
            query : (data: AdminBankInformationModel) => ({
                method : 'PATCH',
                url : `/`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminBankInformationQuery, useAddAdminBankInformationMutation, usePatchAdminBankInformationMutation }  = AdminBankInformationApi;