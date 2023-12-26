
export const GetRole = (): 'CLIENT' | 'TEAM' =>{
    const role = localStorage.getItem('ROLE');
    
    return role !== null ? JSON.parse(role) : 'CLIENT';
}