
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {API_URL} from "../config"

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleRegister = async (data) => {
    data.phone = `+91${data.phone}`;

    await axios.post(`${API_URL}/api/v1/user/register`, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    }).then((res) => {
      toast.success(res.data.message);
      
      // 👉 Encode email and phone before navigating
      const encodedEmail = encodeURIComponent(data.email);
      const encodedPhone = encodeURIComponent(data.phone);
      navigateTo(`/auth/otp-verification/${encodedEmail}/${encodedPhone}`);

    }).catch((error) => {
      toast.error(error.response.data.message);
    });
  };

  return (
    <>
      <div>
        <form className="auth-form" onSubmit={handleSubmit(handleRegister)}>
          <h2>Register</h2>
          <input type="text" placeholder="Name" required {...register("name")} />
          <input type="email" placeholder="Email" required {...register("email")} />
          <div>
            <span>+91</span>
            <input type="number" placeholder="Phone" required {...register("phone")} />
          </div>
          <input type="password" placeholder="Password" required {...register("password")} />
          <div className="verification-method">
            <p>Select verification method</p>
            <div className="wrapper">
              <label>
                <input type="radio" name="verificationMethod" value="email" {...register("verificationMethod")} />
                Email
              </label>
              <label>
                <input type="radio" name="verificationMethod" value="phone" {...register("verificationMethod")} />
                Phone
              </label>
            </div>
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </>
  );
};



export default Register;
