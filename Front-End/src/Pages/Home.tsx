import { useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import axios, {AxiosError, AxiosResponse} from "axios";

type responseData = {
    success: string
}

export default function Home(): JSX.Element{
    const user = useAppSelector(state=>state.user.user);
    const [data, setData] = useState<string | null>();
    
    useEffect(()=>{
        const someFunction = async ()=>{
            try{

                const url:string = `${import.meta.env.VITE_REACT_APP_API_URL}/api/home/`;
    
                const response: AxiosResponse = await axios.get(url, {headers: {'Authorization': `Bearer ${user?.token}`}});
                const dataFromAPI: responseData = response.data;
                setData(dataFromAPI.success);
    
            } catch(err: unknown){
                if(axios.isAxiosError(err)){
                    const newError: AxiosError = err as AxiosError;
                    setData(newError.response?.data?.error ?? 'Unknown error');
                }else{
                    console.log("idk");
                }
            }
        }
        if(user){
            someFunction();
        } else{
            setData("ooga booga");
        }
        
        
    }, []);
    
    return (<div>
            {data}
            {user?.email}
        </div>)
}