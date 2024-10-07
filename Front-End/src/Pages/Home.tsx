import { useAppSelector } from "@/redux/store";
import { FaMicrophoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Graph } from "../components/Graph";
import { Area } from "../components/Area";




const Home = () => {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
    }
    // {user?.email}
    return (
        <div className="h-screen flex justify-between items-start font-poppins">
            {/*<div className=" w-72 h-full p-4 bg-darkGray border-r-2 border-gray-800 align-items">
                <div className="">
                    <h1 className="font-semibold mt-5"> Interview.me</h1>
                </div>
                <div className="">
                    <Button variant = "ghost" className="text-lg hidden md:flex ">Log Out</Button>
                </div>
                <div className="">
                    <h1 className="font-semibold mt-5"> Interview.me</h1>
                </div>
                <div className="">
                    <h1 className="font-semibold mt-5"> Interview.me</h1>
                </div>
            </div> We first need to see if we even have anything to put on here, you can uncomment it and see what it is
            */}
            <div className="w-full h-full p-4 flex flex-col bg-night">
                {/* Top Section */}
                <div className="w-full p-4 text-white mb-6 text-left pl-40 flex justify-between items-center p-4">
                    <h2 className="text-2xl font-bold">Welcome Back {user?.email} 👋 </h2>
                    <Button className="shadow-2xl shadow-indigo-500/50 mr-12" variant="outline">
                        Begin Interview
                    </Button>
                </div>

                {/* Cards Section */}
                <div className="flex flex-wrap gap-16 justify-center mt-8">
                    {/* Card 1 */}
                    <div className="w-full md:w-1/3 lg:w-1/4 p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                        <h3 className="font-bold text-white">Recent Performance</h3>
                        <p className="text-white text-sm">Scored from 1-10</p>
                        <Graph />
                    </div>
                    {/* Card 2 */}
                    <div className="w-full md:w-1/3 lg:w-1/4 p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                        <h3 className="font-bold text-white">Average Performance</h3>
                        <p className="text-white text-sm">Scale from 1-10</p>
                        <Area />
                    </div>
                    {/* Card 3 */}
                    <div className="w-full md:w-1/3 lg:w-1/4 p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                        <h3 className="font-bold text-white">Weak Points</h3>
                        <p className="text-white text-sm">These are things you can improve upon</p>
                        <ul className="list-disc list-inside text-white pt-8 text-left ml-12 space-y-4">
                            <li>Weakness 1: Confidence</li>
                            <li>Weakness 2: Fluency</li>
                            <li>Weakness 3: Speed</li>
                        </ul>
                    </div>
                    {/* Card 4 */}
                    <div className="w-full md:w-1/3 lg:w-1/4 p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2">
                        <h3 className="font-bold text-white">Strong Points</h3>
                        <p className="text-white text-sm">These are things you do well!</p>
                        <ul className="list-disc list-inside text-white pt-8 text-left ml-12 space-y-4">
                            <li>Strength 1: Confidence</li>
                            <li>Strength 2: Fluency</li>
                            <li>Strength 3: Speed</li>
                        </ul>
                    </div>
                    {/* Card 5 */}
                    <div className="w-full md:w-1/3 lg:w-1/4 p-4 bg-darkGray rounded-3xl drop-shadow-2xl h-[300px] border-2 mr-24">
                        <h3 className="font-bold text-white">Data Point 5</h3>
                        <p className="text-white text-sm">Description or value here.</p>
                    </div>
                    {/* Card 6 */}

                </div>
            </div>
        </div>


    )
}

export default Home;