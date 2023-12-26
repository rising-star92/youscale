import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { PageModel } from '../../../models'
import { CLIENT_PAGE_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientPageApi = createApi({
    reducerPath: 'ClientPageApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_PAGE_URL}),
    endpoints: (builder) =>({
        getPage : builder.query<{code: Number, data:PageModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetPageQuery }  = ClientPageApi;