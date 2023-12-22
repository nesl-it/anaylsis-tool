import { User } from "../models/user.model";
import { signJWT } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/error.base";
import { HttpStatusCode } from "../errors/types/HttpStatusCode";
// import { sendEmailNotification } from "../config/sendGridMail";
import { generateRandomDigits } from "../utils/common";
import {
  ChangePasswordI,
  EmailSignInI,
  EmailSignUpI,
  ForgetPasswordI,
  ResendVerifyEmailI,
  ResetPasswordI,
  VerifyEmailI,
} from "./response/user.response";

export const emailSignupService = async (req: Request, res: Response, next: NextFunction): Promise<EmailSignUpI> => {
  const usersInDB = await User.find({ email: req.body.email });

  if (usersInDB.length) {
    throw new AppError(HttpStatusCode.Conflict, "User already exists with this email!");
  }
  const newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
  });

  const user = await newUser.save();
  const token = await signJWT(user._id);

  // Getting authCode by generating random digits
  const authCode = generateRandomDigits(6);

  // Saving user object with authCode to match later during email verification process
  user.authCode = authCode + "";
  await user.save();

  // Now, sending an email notification for email verification
  // await sendEmailNotification({
  //   to: user.email,
  //   subject: "VERIFY YOUR EMAIL",
  //   textMessage: `Your auth code is ${authCode}.`,
  // });

  // Making these undefined will hide these from getting into response
  user.password = undefined;
  user.authCode = undefined;

  return { token, user };
};

export const emailSigninService = async (req: Request, res: Response, next: NextFunction): Promise<EmailSignInI> => {
  const { password }: { email: string; password: string } = req.body;

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "Either email or password is invalid");
  } else {
    const { isMatch } = await user.comparePassword(req.body.password);
    const token = await signJWT(user._id);

    if (isMatch) {
      user.password = undefined;
      user.authCode = undefined;
      return { user: user, token };
    } else {
      throw new AppError(HttpStatusCode.BadRequest, "Either email or password is invalid");
    }
  }
};

export const forgotPasswordService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ForgetPasswordI> => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    // Getting authCode by generating random digits
    const authCode = await generateRandomDigits(6);

    // Saving user object with authCode to match later during email verification process
    user.authCode = String(authCode);
    user.isEmailVerified = false;
    await user.save();

    // Now, sending an email notification for email verification
    // await sendEmailNotification({
    //   to: user.email,
    //   subject: "Expinco Email Verification",
    //   textMessage: `Your auth code is ${authCode}.`,
    // });

    // Send OTP Code to user email
    return { message: "Check your email for OTP Code." };
  }
};

export const changePasswordService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ChangePasswordI> => {
  const user = await User.findOne({ email: req.user.email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    const { isMatch } = await user.comparePassword(req.body.oldPassword);

    if (!isMatch) {
      throw new AppError(HttpStatusCode.NotAcceptable, "Your old password is wrong.");
    }
    user.password = req.body.newPassword;
    await user.save();

    return { message: "Your account password has been changed." };
  }
};

export const verifyEmailService = async (req: Request, res: Response, next: NextFunction): Promise<VerifyEmailI> => {
  const { email, authCode } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    if (user.isEmailVerified) {
      throw new AppError(HttpStatusCode.Conflict, "This email is already verified!");
    }

    if (user.authCode === authCode) {
      user.isEmailVerified = true;
      user.authCode = undefined;
      await user.save();
    } else {
      throw new AppError(HttpStatusCode.BadRequest, "AuthCode is invalid");
    }
    return {
      message: "Your email has been verified! Please login in!",
    };
  }
};

export const resendVerifyEmailService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ResendVerifyEmailI> => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    if (user.isEmailVerified) {
      throw new AppError(HttpStatusCode.Conflict, "This email is already verified!");
    }

    // Getting authCode by generating random digits
    const authCode = await generateRandomDigits(6);

    // Saving user object with authCode to match later during email verification process
    user.authCode = authCode + "";
    await user.save();

    // Now, sending an email notification for email verification
    // await sendEmailNotification({
    //   to: user.email,
    //   subject: "EXPINCO Email Verification",
    //   textMessage: `Your auth code is ${authCode}.`,
    // });

    return {
      message: "Auth code has been send. Check your email!",
    };
  }
};

export const resetPasswordService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ResetPasswordI> => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    if (user.authCode === req.body.authCode) {
      user.password = req.body.newPassword;
      user.isEmailVerified = true;
      await user.save();

      return { message: "Your account's password has been reset." };
    } else {
      throw new AppError(HttpStatusCode.BadRequest, "You have entered an invalid authcode");
    }
  }
};

export const getProfileService = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = await User.findOne({ email: req.user.email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    user.password = undefined;
    user.authCode = undefined;

    return { user: user };
  }
};

export const updateProfileService = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = await User.findOne({ id: req.user.id });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    if (req.body.firstname) {
      user.firstname = req.body.firstname;
    }

    if (req.body.lastname) {
      user.lastname = req.body.lastname;
    }

    if (req.body.displayPicture) {
      user.displayPicture = req.body.displayPicture;
    }

    await user.save();

    return { user: user };
  }
};
