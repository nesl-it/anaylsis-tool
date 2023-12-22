import { AppError } from "../errors/error.base";
import { HttpStatusCode } from "../errors/types/HttpStatusCode";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/apiHelpers";
import { decodeJWT } from "../utils/jwt";
import { User } from "../models/user.model";

export const ProtectedRoute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token: string | null = null;

    const reqHeaderAuth = req.headers.authorization;

    if (reqHeaderAuth && reqHeaderAuth.startsWith("Bearer")) {
        token = reqHeaderAuth.split(" ")[1];
    }
    if (!token) {
        throw new AppError(HttpStatusCode.Unauthorized, "You are not logged in! Please login to access this!");
    }

    // 2) Verification token
    const decodedUser = await decodeJWT(token);

    // 3) Check if user still exists (if deleted from DB or not)
    const currentUser = await User.findById(decodedUser);
    if (!currentUser) {
        throw new AppError(HttpStatusCode.Unauthorized, "The user belonging to the token no longer exists.");
    }

    // 4) Check if user changed password after the token was issued
    // iat--> issued at
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //     next(new AppError(HttpStatusCode.Unauthorized, "User recently changed password! Please login again."));
    // }

    // GRANT ACCESS TO THE PROTECTED ROUTE
    req.user = currentUser; // storing user to the req
    next();
});