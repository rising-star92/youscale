import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminAnnoucementModel } from '../../../models'
import { ADMIN_ANNOUCEMENT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminAnnoucementApi = createApi({
    reducerPath: 'AdminAnnoucementApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_ANNOUCEMENT_URL}),
    endpoints: (builder) =>({
        addAdminAnnoucement : builder.mutation<void, AdminAnnoucementModel>({
            query : (data: AdminAnnoucementModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useAddAdminAnnoucementMutation }  = AdminAnnoucementApi;