import { HttpStatusCode } from "./types/HttpStatusCode";

export class AppError extends Error {
    public statusCode: HttpStatusCode;
    public error: string;
    public isOperational: boolean;

    constructor(statusCode: HttpStatusCode, error: string) {
        super(error);

        this.statusCode = statusCode;
        this.error = error;
        Error.captureStackTrace(this, this.constructor);

        // This any error instantiated with this call is thrown by user itself.
        this.isOperational = true;
    }
}