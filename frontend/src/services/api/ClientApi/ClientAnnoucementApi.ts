import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AdminAnnoucementModel } from '../../../models'
import { CLIENT_ANNOUCEMENT_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientAnnoucementApi = createApi({
    reducerPath: 'ClientAnnoucementApi',
    baseQuery: fetchBaseQuery({ baseUrl: CLIENT_ANNOUCEMENT_URL }),
    endpoints: (builder) =>({
        getAnnoucement : builder.query<{code: Number, data:AdminAnnoucementModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetAnnoucementQuery }  = ClientAnnoucementApi;