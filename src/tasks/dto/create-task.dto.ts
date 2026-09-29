import { IsNotEmpty, IsString } from "class-validator";

export class CreateTaskDto{ // Define type & validation constraint for input data
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsString()
    @IsNotEmpty()
    text: string
}