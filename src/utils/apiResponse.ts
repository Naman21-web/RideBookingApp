import { Response } from "express";
import { STATUS_CODES } from "./constants";

export const successResponse = (
    res: Response,
    data: any,
    message: 'Success',
    statusCode = STATUS_CODES.OK
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};