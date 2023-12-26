import { ClientModel } from "../../models"

export function GetCurrUser(): ClientModel{
    const user = localStorage.getItem('userData')

    return JSON.parse(user ?? '{ }')
}