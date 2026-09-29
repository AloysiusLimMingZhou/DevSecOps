import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './task.controller.js';
import { TasksService } from './task.service.js';
import { Task } from './entity/task.entity.js';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

describe('TasksController', () => {
  let tasksController: TasksController;

  let service = {
    getAllTasks: vi.fn(),
    getTaskById: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn()
  }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{
        provide: TasksService,
        useValue: service
      }],
    }).compile();

    tasksController = moduleRef.get<TasksController>(TasksController);
    
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(tasksController).toBeDefined();
  });

  describe('getAllTask route', () => {
    it('Expect controller should return tasks from service', async () => {
      const tasks:Task[] = [
        {id: 1, title: 'title 1', text: 'text 1', completed: false, createdAt: new Date('2026-09-29T12:00:00Z'), updatedAt: new Date('2026-09-29T12:00:00Z')},
        {id: 2, title: 'title 2', text: 'text 2', completed: false, createdAt: new Date('2026-09-29T12:00:00Z'), updatedAt: new Date('2026-09-29T12:00:00Z')}
      ];

      service.getAllTasks.mockResolvedValue(tasks);

      const result:Task[] = await tasksController.getAllTask();
      expect(result).equal(tasks);
      expect(service.getAllTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTaskById route', () => {
    it('Expect controller should return 1 task from service', async () => {
      const task:Task = {id: 1, title: 'title 1', text: 'text 1', completed: false, createdAt: new Date('2026-09-29T12:00:00Z'), updatedAt: new Date('2026-09-29T12:00:00Z')};

      service.getTaskById.mockResolvedValue(task);

      const result:Task = await tasksController.getTaskById(1);

      expect(result).equal(task);
      expect(service.getTaskById).toHaveBeenCalledTimes(1);
    });

    it('Expect controller failed if no id found', async () => {
      service.getTaskById.mockRejectedValue(new NotFoundException());

      await expect(tasksController.getTaskById(1)).rejects.throw(NotFoundException);
      expect(service.getTaskById).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTask route', () => {
    it('Expect controller should create a task from service', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'title 1',
        text: 'text 1'
      };

      const createdTask: Task = {
        id: 1,
        title: 'title 1',
        text: 'text 1',
        completed: false,
        createdAt: new Date('2026-09-29T12:00:00Z'),
        updatedAt: new Date('2026-09-29T12:00:00Z')
      };

      service.createTask.mockResolvedValue(createdTask);

      const result:Task = await tasksController.createTask(createTaskDto);

      expect(result).equal(createdTask);
      expect(service.createTask).toHaveBeenCalledWith(createTaskDto);
    });

    it('Expect controller should return error when database is down', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'title 1',
        text: 'text 1'
      };

      service.createTask.mockRejectedValue(new InternalServerErrorException());

      await expect(tasksController.createTask(createTaskDto)).rejects.throw(InternalServerErrorException);
      expect(service.createTask).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('updateTask route', () => {
    it('Expect controller should update a task from service', async () => {
      const task:Task = {
        id: 1,
        title: 'title 1',
        text: 'text 1',
        completed: false,
        createdAt: new Date('2026-09-29T12:00:00Z'),
        updatedAt: new Date('2026-09-29T12:00:00Z')
      };

      const updateTaskDto:UpdateTaskDto = {
        completed: true
      };

      const updatedTask:Task = {
        id: 1,
        title: 'title 1',
        text: 'text 1',
        completed: true,
        createdAt: new Date('2026-09-29T12:00:00Z'),
        updatedAt: new Date('2026-09-29T12:00:05Z')
      };

      service.updateTask.mockResolvedValue(updatedTask);

      const result:Task = await tasksController.updateTask(task.id, updateTaskDto);

      expect(result).equal(updatedTask);
      expect(service.updateTask).toHaveBeenCalledWith(task.id, updateTaskDto);
      expect(service.updateTask).toHaveBeenCalledTimes(1);
    });

    it('Expect controller should return error if update fails', async () => {
      const updateTaskDto:UpdateTaskDto = {
        completed: true
      };
      
      service.updateTask.mockRejectedValue(new NotFoundException());

      await expect(tasksController.updateTask(1, updateTaskDto)).rejects.throw(NotFoundException);
      expect(service.updateTask).toHaveBeenCalledWith(1, updateTaskDto);
      expect(service.updateTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTask route', () => {
    it('Expect controller should delete a task from service', async () => {
      const task:Task = {
        id: 1,
        title: 'title 1',
        text: 'text 1',
        completed: false,
        createdAt: new Date('2026-09-29T12:00:00Z'),
        updatedAt: new Date('2026-09-29T12:00:00Z')
      };

      service.deleteTask.mockResolvedValue(undefined);

      const result:void = await tasksController.deleteTask(task.id);

      expect(result).equal(undefined);
      expect(service.deleteTask).toHaveBeenCalledWith(task.id);
      expect(service.deleteTask).toHaveBeenCalledTimes(1);
    });

    it('Expect controller should return error if not found task', async () => {
      service.deleteTask.mockRejectedValue(new NotFoundException());

      await expect(tasksController.deleteTask(1)).rejects.throw(NotFoundException);
      expect(service.deleteTask).toHaveBeenCalledWith(1);
      expect(service.deleteTask).toHaveBeenCalledTimes(1);
    })
  });
});
