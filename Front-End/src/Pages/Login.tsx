import { Button } from "@/components/ui/button";
import {AlertDestructive} from '@/components/ui/AlertDestructive';
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
import { useState } from "react";
import axios, {AxiosError, AxiosResponse} from "axios";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/redux/store";
import { addUser } from "@/redux/features/userSlice";

type ButtonClickEvent = React.SyntheticEvent<HTMLButtonElement>;
  
type formData = {
    email: string,
    password: string
}

type responseData = {
    email: string,
    token: string
}

function Login(): JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate: NavigateFunction = useNavigate();
    const dispatch = useAppDispatch();

    const handleClick = async (e:ButtonClickEvent) =>{
        try{
            if(e.target instanceof HTMLButtonElement){
                const eventData: HTMLButtonElement = e.target as HTMLButtonElement;
                const data: string[] = eventData?.value.split(",");
    
                const formInput:formData = {email: data[0], password: data[1]};

                const url:string = `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/login`;

                const response: AxiosResponse = await axios.post(url, formInput);
                const dataFromAPI: responseData = response.data;
                
                localStorage.setItem('user', JSON.stringify(dataFromAPI));
                dispatch(addUser({email: dataFromAPI.email, token: dataFromAPI.token}));
                setEmail('');
                setPassword('');
                setError(null);
                navigate('/home')
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
        <div className='flex flex-col justify-center h-[calc(90vh-90px)] items-center w-full'>
            <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>This is a basic login page</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full gap-4">
                    <div className="flex flex-col items-start space-y-2">
                        <Label htmlFor="email" >
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="m@example.com" onChange={e => setEmail(e.target.value)} value={email}/>
                    </div>
                    <div className="flex flex-col items-start space-y-2">
                        <Label htmlFor="password" >
                            Password
                        </Label>
                        <Input id="password" onChange={e => setPassword(e.target.value)} type="password" value={password}/>
                    </div>
                </div>
                
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleClick} value={[email, password]}>Login</Button> 
            </CardFooter>
        </Card>
        {error && <AlertDestructive error={error}/>}
    </div>
    )
}

export default Login;
