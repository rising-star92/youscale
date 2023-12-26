import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { PageModel } from '../../../models'
import { ADMIN_PAGE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const AdminPageApi = createApi({
    reducerPath: 'AdminPageApi',
    baseQuery: fetchBaseQuery({baseUrl: ADMIN_PAGE_URL}),
    endpoints: (builder) =>({
        getAdminPage : builder.query<{code: Number, data:PageModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAdminPageQuery }  = AdminPageApi;