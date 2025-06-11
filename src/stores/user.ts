import { create } from 'zustand'

export const userStore=create((set)=>({
    user:{
        username:"Ramus",
        email:"ramus@grafikirdc.com",
        phone:"+243 970 361 929",
        bio:"",
        logo:"/logo.png"
    },
    updateUser:(newUser:any) => set((state:any) => ({ 
        
        users: {...state.user, ...newUser}
     })),

}))