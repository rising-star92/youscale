import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CityModel } from '../../../models'
import { CLIENT_CITY_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientCityApi = createApi({
    reducerPath: 'ClientCityApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_CITY_URL}),
    endpoints: (builder) =>({
        getCity : builder.query<{code: Number, data:CityModel[]}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addCity : builder.mutation<void, CityModel>({
            query : (data: CityModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        patchCity : builder.mutation<void, CityModel>({
            query : (data: CityModel) => ({
                method : 'PATCH',
                url : `/${data.id}`,
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        deleteCity : builder.mutation<void, any>({
            query : (id: any) => ({
                method : 'DELETE',
                url : `/${id}`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetCityQuery, useAddCityMutation, usePatchCityMutation, useDeleteCityMutation }  = ClientCityApi;