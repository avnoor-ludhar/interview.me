import { Button } from "@/components/ui/button";
import { AlertDestructive } from "@/components/ui/AlertDestructive";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/redux/store";
import {addUser} from '@/redux/features/userSlice';

type ButtonClickEvent = React.SyntheticEvent<HTMLButtonElement>;
  
type formData = {
    email: string,
    password: string,
    passwordConfirm: string
}

type responseData = {
    email: string,
    token: string
}

function SignUp(): JSX.Element {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm , setPasswordConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate: NavigateFunction = useNavigate();
    const dispatch = useAppDispatch();

    //just sends an API reques tto the backend to get the JWT and stores it in local storage and the redux store
    const handleClick = async (e:ButtonClickEvent) =>{
        try{
            if(e.target instanceof HTMLButtonElement){
                const eventData: HTMLButtonElement = e.target as HTMLButtonElement;
                const formResponse: string[] = eventData?.value.split(",");

                const formInput:formData = {email: formResponse[0], password: formResponse[1], passwordConfirm: formResponse[2]};

                const url:string = `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/register`;

                const APIResponse  = await axios.post(url, formInput);
                const data: responseData = APIResponse?.data;

                localStorage.setItem('user', JSON.stringify(data));
                dispatch(addUser({email: data.email, token: data.token}))
                setEmail('');
                setPassword('');
                setPasswordConfirm('');
                setError('');
                navigate('/home');
            }
        } catch(err: unknown){
            if(axios.isAxiosError(err)){
                const newError: AxiosError = err as AxiosError;
                setError(newError.response?.data?.error ?? 'Unknown error');
            }else{
                console.log("idk");
            }
            
        }
    }
    //basically shadcn will give us the base of the component
    //then we have to add all the stuff we want on top
    return (
        <div className='flex flex-col items-center justify-center h-[calc(90vh-90px)] w-full'>
            <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Sign up</CardTitle>
                <CardDescription>This is a basic signup page</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full gap-4">
                    <div className="flex flex-col items-start space-y-2">
                        <Label htmlFor="email" >
                            Email
                        </Label>
                        <Input id="email" onChange={e => setEmail(e.target.value)} type="email" placeholder="m@example.com" value={email}/>
                    </div>
                    <div className="flex flex-col items-start space-y-2">
                        <Label htmlFor="password" >
                            Password
                        </Label>
                        <Input id="password" onChange={e => setPassword(e.target.value)} type="password" value={password}/>
                    </div>
                    <div className="flex flex-col items-start space-y-2">
                        <Label htmlFor="password" >
                            Verify Password
                        </Label>
                        <Input id="passwordConfirm" onChange={e => setPasswordConfirm(e.target.value)} type="password" value={passwordConfirm}/>
                    </div>
                </div>
                
            </CardContent>
            <CardFooter>
                <Button onClick={handleClick} className="w-full" value={[email, password, passwordConfirm]}>Create account</Button> 
            </CardFooter>
        </Card>
        {error && <AlertDestructive error={error}/>}
    </div>
    )
}

export default SignUp;
