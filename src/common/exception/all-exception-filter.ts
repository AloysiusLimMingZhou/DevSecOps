import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException) // Only catch all Http related errors
export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp(); // Switch host to accept HTTP request
        const res = ctx.getResponse<Response>(); // HTTP response
        const req = ctx.getRequest<Request>(); // HTTP request

        const httpStatus = exception instanceof HttpException // If its http exception log it as the status code, if no code then is code 500 server error
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = { // Log response in json format, include status code, time, url
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: req.url
        };

        res.status(httpStatus).json(responseBody); // Record the status & body in response object
    }
}