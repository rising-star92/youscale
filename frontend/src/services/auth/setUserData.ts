
export function setUserData(user: Object | null){
    localStorage.setItem('userData', JSON.stringify(user))
}