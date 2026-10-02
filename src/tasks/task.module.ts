import { Module } from '@nestjs/common';
import { TasksService } from './task.service.js';
import { TasksController } from './task.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task])], // Setup TypeORM Module, forFeature([Task]) means registering Task Entity inside Task Module. Since we're only using Task table in database we'll just use Task
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
