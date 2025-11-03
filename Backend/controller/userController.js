import ErrorHandler from "../middleware/errorMiddleware.js";
import { catchAsyncErrors } from "../middleware/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import dotenv from "dotenv";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
dotenv.config({ path: "./config/config.env" });
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, verificationMethod } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password || !phone || !verificationMethod) {
    return next(new ErrorHandler("Required all fields.", 400));
  }

  // Function to validate phone number format (India format)
  function validatePhoneNumber(phone) {
    const phoneRegex = /^\+91?\d{10}$/;
    return phoneRegex.test(phone);
  }

  // Validate phone number
  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  // Check if the user already exists with the given email or phone
  const existUser = await User.findOne({
    $or: [
      { email, accountVerified: true },
      { phone, accountVerified: true },
    ],
  });

  if (existUser) {
    return next(new ErrorHandler("Phone or email is already registered", 400));
  }

  // Check if there are more than 3 unsuccessful registration attempts for this email or phone
  const attempByUser = await User.find({
    $or: [
      { email, accountVerified: false },
      { phone, accountVerified: false },
    ],
  });
  if (attempByUser.length > 3) {
    return next(
      new ErrorHandler("You have exceeded the maximum number of attempts.", 400)
    );
  }

  // Create user and generate the verification code
  const userdata = { name, email, password, phone };
  const user = await User.create(userdata);
  const verificationCode = await user.generateVerificationCode();
  await user.save();
console.log("hi"+verificationCode)
  // Send verification code based on the method (email or phone)
  sendVerificationCode(
    verificationMethod,
    verificationCode,
    name,
    email,
    phone,
    res,
    next
  );
});

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  name,
  email,
  phone,
  res,
  next
) {
  try {
    // If the verification method is email
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);
      await sendEmail({ email, subject: "Your verification code", message });
      return res.status(200).json({
        success: true,
        message: `Verification code successfully sent to ${name}`,
      });
    }
    // If the verification method is phone
    else if (verificationMethod === "phone") {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split("") // Split verification code into individual characters
        .join(" "); // Join them with spaces

      // Send OTP via Twilio phone call
      await client.calls.create({
        twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      return res.status(200).json({
        success: true,
        message: `OTP sent to ${phone}`,
      });
    }
    // Invalid verification method
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid verification method.",
      });
    }
  } catch (error) {
    console.log("error ", error);
    return next(new ErrorHandler("Verification code failed to send.", 500)); // Pass the error to the error handling middleware
  }
}

// Function to generate the email template for sending verification code
function generateEmailTemplate(verificationCode) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Thank you for registering. Please use the following verification code to complete your sign-up process:</p>
            <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${verificationCode}</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <p style="margin-top: 30px; color: #999;">&copy; ${new Date().getFullYear()} Your Company Name</p>
        </div>
    </div>
  `;
}

export const verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp, phone } = req.body;

  // Function to validate phone number format (India format)
  function validatePhoneNumber(phone) {
    const phoneRegex = /^\+91?\d{10}$/;
    return phoneRegex.test(phone);
  }

  // Validate phone number
  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      accountVerified: true,
    });

    if (existingUser) {
      return next(new ErrorHandler("User already exists.", 200));
    }

    const userAllEnties = await User.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    }).sort({ createdAt: -1 });

    let user = userAllEnties[0];

    if (!user) {
      return next(new ErrorHandler("User not found.", 400));
    }
    if (userAllEnties.length > 1) {
      user = userAllEnties[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { email, accountVerified: false },
          { phone, accountVerified: false },
        ],
      });
    }
    // Check if user already exists with verified account

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid otp", 400));
    }

    const currentDate = Date.now();
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();

    if (currentDate > verificationCodeExpire) {
      return next(new ErrorHandler("otp expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;

    await user.save({ validateModifiedOnly: true });
    sendToken(user, 200, "Account verified", res);
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );
  if (!user) {
    return next(new ErrorHandler("Invalid email or phone.", 400));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  sendToken(user, 200, "User logged in successfully.", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "User logged out successfully.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPaaawosdUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = ` Your reset password token is :--\n\n ${resetPaaawosdUrl} \n\n if you have not requested this email please ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "Authentication reset Password",
      message,
    });
    res.status(200).json({
      success: true,
      message: ` Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        error.message ? error.message : "Cannot send reset password token",
        500
      )
    );
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("password and confirm password do not match.", 400)
    );
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, "Reset password successfully.", res);
});
