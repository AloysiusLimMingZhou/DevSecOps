import { Module } from '@nestjs/common';
import { TasksService } from './task.service.js';
import { TasksController } from './task.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
