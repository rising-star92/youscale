import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CityModel } from '../../../models'
import { CLIENT_TEAM_CITY_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientTeamCityApi = createApi({
    reducerPath: 'ClientTeamCityApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_TEAM_CITY_URL}),
    endpoints: (builder) =>({
        getClientTeamCity : builder.query<{code: Number, data:CityModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetClientTeamCityQuery }  = ClientTeamCityApi;