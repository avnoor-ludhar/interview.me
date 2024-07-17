import { useAppSelector } from "@/redux/store";
import { FaMicrophoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () =>{
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();

    if(!user){
        navigate('/login');
    }

    return (
        <div>
            <p>{user?.email}</p>
            <div className="flex flex-col items-center">
                <button className="mt-20 scale-[3] bg-red-600 p-1 rounded-full hover:opacity-80"><FaMicrophoneAlt /></button>
            </div>
        </div>
    )
}

export default Home;