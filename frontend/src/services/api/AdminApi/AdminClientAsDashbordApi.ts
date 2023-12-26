import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ClientAsDashbordModel } from '../../../models'
import { ADMIN_CLIENT_AS_DASHBORD_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminClientAsDashbordApi = createApi({
    reducerPath: 'AdminClientAsDashbordApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_CLIENT_AS_DASHBORD_URL}),
    endpoints: (builder) =>({
        patchClientAsDashbord : builder.mutation<void, ClientAsDashbordModel>({
            query : (data: ClientAsDashbordModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { usePatchClientAsDashbordMutation }  = AdminClientAsDashbordApi;