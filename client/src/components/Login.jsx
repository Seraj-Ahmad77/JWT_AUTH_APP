import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import {  Link, useNavigate } from "react-router-dom";
import {API_URL} from "../config"
const Login = () => {
  const {setIsAuthenticated,setUser}=useContext(Context);
  const navigateTo=useNavigate();
  const {
    register,handleSubmit,formState:{errors}
    
  }=useForm();

  const handleLogin=async(data)=>{
    await axios.post(`${API_URL}/api/v1/user/login`,data,{
      withCredentials:true,
      headers:{
        "Content-Type":"application/json"
      },
    }).then((res)=>{
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);
      navigateTo("/")
    }).catch((error)=>{
      toast.error(error.response.data.message);
    });
  }
  return <>
  <form className="auth-form " onSubmit={handleSubmit((data)=>handleLogin(data))}>
    <h2>Login</h2>
    <input type="email" required placeholder="Email" {...register("email")}/>    
    <input type="password" required placeholder="password" {...register("password")}/>
    <p className="forgot-password">
      <Link to={"/password/forgot"}> forgot your password</Link></p>
      <button type="submit">Login</button>    

  </form>
  </>;
};

export default Login;
