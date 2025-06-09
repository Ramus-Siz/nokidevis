import { create } from 'zustand'

export const userStore=create((set)=>({
    user:{
        username:"Ramus",
        email:"ramus@grafikirdc.com"
    },
    updateUser:(newUser:any) => set((state:any) => ({ 
        
        users: {...state.user, ...newUser}
     })),

}))