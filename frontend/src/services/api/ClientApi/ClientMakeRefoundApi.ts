import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ClientMakeRefundModel } from '../../../models'
import { CLIENT_MAKEREFOUND_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientMakeRefoundApi = createApi({
    reducerPath: 'ClientMakeRefoundApi',
    baseQuery: fetchBaseQuery({ baseUrl: CLIENT_MAKEREFOUND_URL }),
    endpoints: (builder) =>({
        
        ClientMakeRefound : builder.mutation<void, ClientMakeRefundModel>({
            query : (data: ClientMakeRefundModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useClientMakeRefoundMutation }  = ClientMakeRefoundApi;