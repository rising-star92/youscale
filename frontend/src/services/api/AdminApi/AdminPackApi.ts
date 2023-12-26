import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminPackModel } from '../../../models'
import { ADMIN_PACK_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminPackApi = createApi({
    reducerPath: 'AdminPackApi',
    baseQuery: fetchBaseQuery({ baseUrl: ADMIN_PACK_URL }),
    endpoints: (builder) =>({
        
        getPack : builder.query<{code: Number, data: AdminPackModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        PatchPack : builder.mutation<void, AdminPackModel>({
            query : (data: AdminPackModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),
    })
})

export const { useGetPackQuery, usePatchPackMutation }  = AdminPackApi;