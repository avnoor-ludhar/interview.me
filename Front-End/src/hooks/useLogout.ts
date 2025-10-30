import { useAppDispatch } from "@/redux/store";
import { removeUser } from "@/redux/features/userSlice";
import api from "@/lib/axios";
import * as Sentry from '@sentry/react';

export type LogoutHook = {
    logout: () => void
}

export const useLogout = (): LogoutHook =>{
    const dispatch = useAppDispatch();

    const logout = async () =>{
        // Create a custom span for the logout operation
        await Sentry.startSpan({
            name: 'user.logout',
            op: 'auth.logout',
            attributes: {
                'component': 'frontend-logout'
            }
        }, async () => {
            try{
                await api.post('/api/user/logout');
                dispatch(removeUser());
                
                // Clear user context from Sentry
                Sentry.setUser(null);
            } catch(error){
            console.error('Logout failed', error);
            
            // Capture logout errors in Sentry
            Sentry.captureException(error, {
                tags: {
                    component: 'useLogout',
                    action: 'logout-failed'
                }
            });
            }
        });
    }

    return {logout};
}
