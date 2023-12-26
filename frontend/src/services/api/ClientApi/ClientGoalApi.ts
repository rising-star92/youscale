import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { GoalModel, addGoalModel } from '../../../models'
import { CLIENT_GOAL_URL } from '../../url/API_URL'

const token =  localStorage.getItem('token')

export const ClientGoalApi = createApi({
    reducerPath: 'ClientGoalApi',
    baseQuery: fetchBaseQuery({baseUrl: CLIENT_GOAL_URL}),
    endpoints: (builder) =>({
        getGoal : builder.query<{code: Number, data:GoalModel}, void>({
            query:() => ({
                method: 'GET',
                url: '/',
                headers: { Authorization: `Bear ${token}` },
            })
        }),
        
        addGoal : builder.mutation<void, addGoalModel>({
            query : (data: addGoalModel) => ({
                method : 'POST',
                url : '/',
                body : data,
                headers: { Authorization: `Bear ${token}` },
            })
        }),

        resetGoal : builder.mutation<void, void>({
            query : () => ({
                method : 'DELETE',
                url : `/`,
                headers: { Authorization: `Bear ${token}` },
            })
        })
    })
})

export const { useGetGoalQuery, useAddGoalMutation, useResetGoalMutation }  = ClientGoalApi;