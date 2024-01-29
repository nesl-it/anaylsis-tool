import { User } from "../models/user.model";
import { signJWT } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/error.base";
import { HttpStatusCode } from "../errors/types/HttpStatusCode";
import { ChangePasswordI, EmailSignInI, EmailSignUpI } from "./response/user.response";

export const emailSignupService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<EmailSignUpI> => {
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

  // Saving user object with authCode to match later during email verification process
  await user.save();

  // Making these undefined will hide these from getting into response
  user.password = undefined;
  return { token, user };
};

export const emailSigninService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<EmailSignInI> => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "Either email or password is invalid");
  } else {
    const { isMatch } = await user.comparePassword(req.body.password);
    const token = await signJWT(user._id);

    if (isMatch) {
      user.password = undefined;
      return { user: user, token };
    } else {
      throw new AppError(HttpStatusCode.BadRequest, "Either email or password is invalid");
    }
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

export const getProfileService = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = await User.findOne({ email: req.user.email });
  console.log({ user });
  if (!user) {
    throw new AppError(HttpStatusCode.BadRequest, "User doesn't exists with this email");
  } else {
    user.password = undefined;

    return { user: user };
  }
};

export const updateProfileService = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = await User.findOne({ _id: req.user.id });
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
