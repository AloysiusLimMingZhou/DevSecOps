import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Task } from './entity/task.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
    constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) {}; // Inject Repository from TypeORM to act as middleman between route services & database. Repository with Task type mean refer to Task entity
    
    async getAllTasks(): Promise<Task[]> { // FInd & Sort out all tasks by latest creation, so descending order
        const tasks:Task[] = await this.taskRepository.find({
            order: {
                createdAt: 'DESC'
            }
        });
        return tasks;
    }

    async getTaskById(id: number): Promise<Task> { // Find Task by ID
        const task: Task | null = await this.taskRepository.findOneBy({id: id});
        if(!task) throw new NotFoundException('Task is not found!'); // If couldn't find task throw by ID throw error
        return task;
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const task: Task = this.taskRepository.create({ // Create task using CreateTaskDto format, default completion is false. Repository.create(...) only save the data into memory.
            title: createTaskDto.title,
            text: createTaskDto.text,
            completed: false
        });

        try {
            await this.taskRepository.save(task); // Repository.save() only then saves the data into database in postgres
            return task;
        } catch {
            throw new InternalServerErrorException('Server or Database is down');
        }
    }

    async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const task: Task | null = await this.taskRepository.findOneBy({id: id});
        if(!task) throw new NotFoundException("Task is not found!");

        const updatedTask: Task = {
            id: task.id,
            title: updateTaskDto.title ?? task.title,
            text: updateTaskDto.text ?? task.text,
            completed: updateTaskDto.completed ?? task.completed
        };

        try{
            await this.taskRepository.save(updatedTask);
            return updatedTask;
        } catch {
            throw new InternalServerErrorException('Server or Database is down');
        }
    }

    async deleteTask(id: number): Promise<void> {
        const task: Task | null = await this.taskRepository.findOneBy({id: id});
        if(!task) throw new NotFoundException("Task is not found!");

        try {
            await this.taskRepository.remove(task);
        } catch {
            throw new InternalServerErrorException("Server or Database is not working");
        }
    }
}
