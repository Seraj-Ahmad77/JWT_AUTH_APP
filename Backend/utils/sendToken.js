export const sendToken = async (user, statusCode, message, res) => {
  const token = await user.generateToken();
  
  const isProduction = process.env.NODE_ENV === "production";

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      // secure: isProduction,  
      // sameSite: isProduction ? "None" : "Lax",
      secure:true,
      sameSite:"None"
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};
