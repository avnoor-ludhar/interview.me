import { useAppDispatch } from "@/redux/store";
import { removeUser } from "@/redux/features/userSlice";

export type LogoutHook = {
    logout: () => void
}

export const useLogout = (): LogoutHook =>{
    const dispatch = useAppDispatch();

    const logout = () =>{

        localStorage.removeItem("user");
        dispatch(removeUser());
    }

    return {logout};
}
