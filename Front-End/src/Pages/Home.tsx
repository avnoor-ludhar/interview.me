import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Graph } from "../components/Graph";
import { Area } from "../components/Area";
import Chat from "@/components/Chat";




const Home = () => {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
    }

    return (
        <div className="flex justify-between items-start font-poppins">
            <div className="w-full h-full p-4 flex flex-col bg-night">
                {/* Top Section */}
                <div className="w-full text-white mb-6 text-left pl-20 flex justify-between items-center p-4">
                    <h2 className="text-2xl font-bold">Welcome Back {user?.email} 👋 </h2>
                    <div className="flex flex-row justify-start gap-4">
                        <Button className="shadow-2xl shadow-indigo-500/50" variant="outline" onClick={() => navigate("/intake")}>
                            Begin Interview
                        </Button>
                        <Button className="shadow-2xl shadow-indigo-500/50 mr-12" variant="outline" onClick={() => navigate("/intake")}>
                            Log out
                        </Button>
                    </div>
                    
                </div>

                {/* Cards Section */}
                <div className="flex lg:flex-row flex-col-reverse gap-8 w-full items-center justify-between mt-4">
                    <div className="flex flex-wrap flex-row justify-evenly gap-10 w-3/4 mb-10">
                        {/* Card 1 */}
                        <div className="w-full lg:w-[45%] max-w-[400px] p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                            <h3 className="font-bold text-white">Recent Performance</h3>
                            <p className="text-white text-sm">Scored from 1-10</p>
                            <Graph />
                        </div>
                        {/* Card 2 */}
                        <div className="w-full lg:w-[45%] max-w-[400px] p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                            <h3 className="font-bold text-white">Average Performance</h3>
                            <p className="text-white text-sm">Scale from 1-10</p>
                            <Area />
                        </div>
                        {/* Card 3 */}
                        <div className="w-full lg:w-[45%] max-w-[400px] p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                            <h3 className="font-bold text-white">Weak Points</h3>
                            <p className="text-white text-sm">These are things you can improve upon</p>
                            <ul className="list-disc list-inside text-white pt-8 text-left ml-4 space-y-4">
                                <li>Weakness 1: Confidence</li>
                                <li>Weakness 2: Fluency</li>
                                <li>Weakness 3: Speed</li>
                            </ul>
                        </div>
                        {/* Card 4 */}
                        <div className="w-full lg:w-[45%] max-w-[400px] p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                            <h3 className="font-bold text-white">Strong Points</h3>
                            <p className="text-white text-sm">These are things you do well!</p>
                            <ul className="list-disc list-inside text-white pt-8 text-left ml-4 space-y-4">
                                <li>Strength 1: Confidence</li>
                                <li>Strength 2: Fluency</li>
                                <li>Strength 3: Speed</li>
                            </ul>
                        </div>
                    </div>
                    {/* Card 5 */}
                    <div className="w-3/4 lg:w-1/3 p-4 bg-darkGray rounded-3xl drop-shadow-2xl border-2 h-fit max-h-[500px]">
                        <h3 className="font-bold text-white">Interview Chat Log</h3>
                        <p className="text-white text-sm">View your most recent chat log!</p>
                        {/* <Chat /> */}
                    </div>
                </div>
                
                
            </div>
        </div>


    )
}

export default Home;