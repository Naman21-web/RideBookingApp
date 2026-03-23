import {Request,Response,NextFunction} from 'express';
import {AppError} from "../utils/AppError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Error: ",err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || null;

    // Unknown errors
    if (!(err instanceof AppError)) {
        statusCode = 500;
        message = 'Something went wrong';
    }

    //Prisma Errors
    if(err.code === 'P2002'){
        statusCode = 400;
        message = 'Duplicate field value';
    }

    res.status(statusCode).json({
        success:false,
        message,
        ...(errors && {errors})
    });
};