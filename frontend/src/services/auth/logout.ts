
export function logOut(){
    localStorage.removeItem('STEP')
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    window.location.href = '/login'
}