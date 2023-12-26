import { GetTeamMemberModel } from "../../models"

export function GetCurrTeamMember(): GetTeamMemberModel{
    const user = localStorage.getItem('userData')

    return JSON.parse(user ?? '{ }')
}