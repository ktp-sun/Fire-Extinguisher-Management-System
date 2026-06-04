import { useRef, useState } from "react";
import { useAuth } from "../../Auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import SweetAlert from "sweetalert2";
import Logo from '../../assets/login-assets/SecondaryLogo/Sugar-rider-logo2-2.png'
import hide from '../../assets/login-assets/hide.png'
import showIcon from '../../assets/login-assets/show.png'
import userIcon from '../../assets/login-assets/user-solid-24.png'
import lock from '../../assets/login-assets/bxs-lock-alt.svg'
import line from '../../assets/login-assets/line.png'

import './Login.css';


function LoginPage() {
  const userRef = useRef();
  const passRef = useRef();
  const navigate = useNavigate();

  const { handleLogin } = useAuth();
  const [show, setShow] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      SweetAlert.showLoading();
      const status = await handleLogin(
        userRef.current.value,
        passRef.current.value
      );
      
      if (status === 200) {
        navigate("/dashboard");
      } else if (status === 401) {
        passRef.current.value = "";
        SweetAlert.fire({
          icon: "error",
          title: "Login Failed",
          text: "Username or Password is incorrect",
          confirmButtonColor: "#FD6E28",
        });
      } else if (status === 403) {
        SweetAlert.fire({
          icon: "error",
          title: "Account Inactive",
          text: "Your account is currently inactive",
          confirmButtonColor: "#FD6E28",
        });
      }
    } catch (error) {
      SweetAlert.close();
      console.error(error);
    }
  }
  
  const toggleShow = (e) => {
    e.preventDefault(); 
    setShow((prevShow) => !prevShow);
  };

  return (
    
    <div className='login-background flex justify-center items-center min-h-screen bg-cover'>
      <div className="flex flex-col min-w-[270px] items-center gap-4 p-4 bg-white/[0.75] drop-shadow rounded-[8px] backdrop-blur-sm">
        <div className="p-2">
          <img
            className="w-[360px] h-[110px] object-contain mx-auto"
            src= {Logo}
            alt="Logo"
          />
        </div>

        <div className="flex w-full">
          <form name="LoginForm" action="" className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>

            <div className="flex items-center border border-gray rounded-[6px] h-12 w-full px-2 ">
              <img
                className="w-[16px] h-[16px] opacity-40"
                src={userIcon}
                alt="User Icon"
              />
              <input
                className="h-11 w-full ml-1 px-1 mb-[1px] bg-[rgba(255,255,255,0)] placeholder:text-[#000]/60 focus:outline-none"
                type="text"
                autoComplete="on"
                placeholder="Username"
                name="metthier-login-username"
                ref={userRef}
              />
            </div>

            <div className="flex items-center border border-gray rounded-[6px] w-full h-12 px-2">
              <img
                className="w-[16px] h-[16px] opacity-40"
                src={lock}
                alt="Lock Icon"
              />
              <input
                className="h-11 w-full ml-1 px-1 mb-[1px] bg-[rgba(255,255,255,0)] placeholder:text-[#000]/60 text-dec focus:outline-none "
                type={show ? "password" : "text"}
                placeholder="Password"
                name="metthier-login-password"
                ref={passRef}
              />

              <button onClick={toggleShow} type="button">
                <img
                  className="scale-x-[-1] opacity-60"
                  src={
                    show
                      ? hide
                      : showIcon
                  }
                  alt="Toggle Password Visibility"
                />
              </button>
            </div>
            <div className="flex gap-2 justify-center items-center flex-wrap-reverse">
              <button
                className="flex flex-1  justify-center items-center bg-secondary min-w-[120px] rounded-[4px] h-[45px] hover:brightness-110"
                type="submit"
              >
                <b className="text-[#fff]">Login</b>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
