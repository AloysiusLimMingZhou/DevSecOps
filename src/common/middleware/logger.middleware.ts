import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable() // Injectable means can be registered into Nest DI to be shared with other modules
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction){ // NestMiddleware interface implement function
        const startTime: number = Date.now(); // Record start time
        res.on('finish', () => {// When API req is finished, log the stop time and time taken
            const duration: number = Date.now() - startTime;
            console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}`); // Format: PATCH /tasks/:id 200 13ms
        });
        next(); // next() means pass on to the next function
    }
}