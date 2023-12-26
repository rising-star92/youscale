
export const SetRole = (arg: 'CLIENT' | 'TEAM' ) =>{
    if(arg === 'CLIENT') localStorage.setItem('ROLE', JSON.stringify(arg))
    else localStorage.setItem('ROLE', JSON.stringify(arg))
}
