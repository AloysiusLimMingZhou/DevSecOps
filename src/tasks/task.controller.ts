import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Version } from '@nestjs/common';
import { TasksService } from './task.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Controller('task')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Version('1') // /api/v1
  @Get()
  @HttpCode(200)
  getAllTask() {
    return this.tasksService.getAllTasks(); // Get all tasks lists from database. Call TaskService instance
  }

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  getTaskById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) // Ensure param is integer, else 400
    id: number
  ) {
    return this.tasksService.getTaskById(id); // Get tasks lists by ID from param from database. Call TaskService instance
  }

  @Version('1')
  @Post()
  @HttpCode(201)
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto); // Post create a task into database by referring content from body. Call TaskService instance
  }

  @Version('1')
  @Patch(':id')
  @HttpCode(200)
  updateTask(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) 
    id: number, 
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return this.tasksService.updateTask(id, updateTaskDto); // Patch  an existing task from database by finding right ID through param for finding the existing task and edit content based on content from body. Call TaskService instance
  }

  @Version('1')
  @Delete(':id')
  @HttpCode(204)
  deleteTask(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) 
    id: number
  ) {
    return this.tasksService.deleteTask(id); // Delete a task from database by finding the existing task ID from param from database. Call TaskService instance
  }
}
