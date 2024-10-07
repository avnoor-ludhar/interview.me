import { Button } from "@/components/ui/button";
import { TypeAnimation } from "react-type-animation";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";

export default function Landing(): JSX.Element {
  const user = useAppSelector(state => state.user.user);
  const navigate = useNavigate();

  if(user){
    navigate('/home');
  }
  
  return (
    <>
      <div className="flex flex-col font-poppins">
        <div className="text-5xl font-medium md:text-7xl w-[85%] m-auto md:w-[100%] pt-12 bg-gradient-to-r from-pink-700 via-violet-500 to-indigo-600 text-transparent bg-clip-text ">
          <h1>
            Interview Smarter<br></br> Excel Faster with A.I
          </h1>
        </div>
        <div className="text-md md:text-lg w-[85%] mt-8 md:w-[50%] m-auto">
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis
            unde distinctio optio iusto eius blanditiis. Nemo, nesciunt et amet
            dicta tenetur, more yip yap ypo speak spoke poke loke doke foke
            spoke mdikoasnf ndfjkldasn ffndsklf sandfkls adnfkl
          </p>
        </div>
        <div className="flex justify-around w-[50%] m-auto mt-5 outline-violet-600">
          <Button className="shadow-2xl shadow-indigo-500/50" variant="outline">
            Get Started
          </Button>
          <Button className="shadow-2xl shadow-indigo-500/50" variant="outline">
            Learn more
          </Button>
        </div>

        <div className="flex flex-row relative bg-slate-950  w-[65%] h-96 m-auto mt-24 mb-48 shadow-2xl shadow-indigo-500/50 blur-lg md:w-[70%]">
          <div className="absolute w-[100%] bg-slate-800 justify-around flex">
            <p>Home</p>
            <p>Contact</p>
            <p>Page</p>
            <p>Packages</p>
          </div>
          <div className=" bg-slate-900 w-1/4 flex flex-col justify-evenly">
            <p>AI</p>
            <p>Select</p>
            <p>Selection</p>
            <p>More Selection</p>
            <p>More Selection</p>
          </div>
          <div className="bg-slate-700 w-4/6 h-4/6 m-auto">
            PLACEHOLDER!!!! WILL BE DASHBOARD, THIS DESIGN LOOKS 100X BETTER
            TRUST, AND WILL BE MORE PRATICAL
          </div>
        </div>
      </div>

      <div className="font-medium font-Work-Sans text-2xl md:text-6xl pb-36 flex flex-col bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-300 text-transparent bg-clip-text">
        <h1 className="pb-2 md:text-base text-sky-600 text-xs ">
          OVERPOWER WITH A.I
        </h1>
        <TypeAnimation
          sequence={[
            // Same substring at the start will only be typed out once, initially
            "Ace your Medical School Interview",
            1000, // wait 1s before replacing "Mice" with "Hamsters"
            "Ace your Behavioural Interview",
            1000,
            "Ace your University Interview",
            1000,
            "Ace your Job Interview",
            1000,
          ]}
          wrapper="span"
          speed={50}
          repeat={Infinity}
        />
        <p className="font-normal text-sm w-[80%] md:w-[50%] md:text-lg m-auto pt-5 text-white ">
          At Interview.me, we revolutionize interview preparation with AI.
          Practice personalized sessions to ace any interview effortlessly!
        </p>

        <div className="flex flex-col m-auto md:flex-row ">
          <div className="flex flex-col text-left">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[70%] h-56 mt-12 mx-16 md:mx-24 rounded-3xl shadow-md text-black shadow-violet-500 blur-sm"></div>
            <div className="flex flex-col text-white font-normal ml-24 ">
              <div className="mt-12">
                <h3 className="text-3xl">Mock Interview</h3>
              </div>
              <div className="text-base ml-0.5 w-[90%] mt-1 text-slate-300">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-left">
            <div className="bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% w-[70%] h-56 mx-16 md:mx-24 mt-12 rounded-3xl shadow-md shadow-indigo-600 blur-sm"></div>
            <div className="flex flex-col text-white font-normal ml-24">
              <div className="mt-12">
                <h3 className="text-3xl">Essay Grader</h3>
              </div>
              <div className="text-base ml-0.5 w-[80%] mt-1 text-slate-300">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col m-auto md:flex-row">
          <div className="flex flex-col text-left align-center justify-center">
            <div className="bg-gradient-to-r from-pink-500 to-yellow-500 w-[70%] h-56 mx-16 md:mx-24 mt-12 rounded-3xl shadow-md shadow-yellow-300 blur-sm"></div>
            <div className="flex flex-col text-white font-normal ml-16 md:ml-24">
              <div className="mt-12">
                <h3 className="text-3xl">Improve Admission</h3>
              </div>
              <div className="text-base ml-0.5 w-[80%] text-slate-300">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-left">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-300 w-[70%] h-56 mx-16 md:mx-24 mt-12 rounded-3xl shadow-md shadow-violet-600 blur-sm"></div>
            <div className="flex flex-col text-white font-normal ml-24">
              <div className="mt-12">
                <h3 className="text-3xl">School Tailored</h3>
              </div>
              <div className="text-base ml-0.5 w-[80%] text-slate-300">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex md:ml-14">
        <div className="flex flex-col font-Work-Sans mb-10">
          <div className="text-center md:text-left">
            <h1 className="font-semibold text-4xl md:text-7xl w-[100%] text-indigo-400">
              Success is at your fingertips{" "}
            </h1>
            <p className="text-center md:text-left pt-2 text-xl w-[80%] m-auto md:m-0 ">
              Join our waitlist to be the first to know when Interview.me goes
              live!
            </p>
          </div>

          <div className="flex max-w-sm space-x-2 mt-5 m-auto md:m-0 md:mt-96 pb-10">
            <Input type="email" placeholder="Email" />
            <Button type="submit" className="text-white">
              Subscribe
            </Button>
          </div>
        </div>
      </div>


    </>
  );
}
