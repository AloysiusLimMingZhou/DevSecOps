import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateTaskDto{ // Define input data type & validation
    @IsString()
    @IsOptional() 
    @IsNotEmpty()
    title?: string; // We combine isoptional & isnotempty so that the title doesnt have to provide a new value, but if did so must provide a value

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    text?: string;

    @IsBoolean()
    @IsOptional()
    @IsNotEmpty()
    completed?: boolean;
}