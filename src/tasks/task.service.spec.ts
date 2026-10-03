import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './task.service.js';
import { Task } from './entity/task.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let tasksService: TasksService;

  const mockRepository = { // Create mock functions for repository TypeORM so that it doesnt interact with actual data, but u feed it with expected results to see if service logic runs correctly
    findOneBy: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn()
  };

  beforeEach(async () => { // Reset mock data before each test 
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService, 
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository
        }
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);

    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('getAllTasks', () => { // getAllTasks() unit test
    it('It should return a list of tasks', async () => {
      const tasks:Task[] = [ // Create mock tasks database
        {id: 1, title: "Title 1", text: "Text 1", completed: false},
        {id: 2, title: "Title 2", text: "Text 2", completed: true}
      ]

      mockRepository.find.mockResolvedValue(tasks); // Tell mock database func to return the mock data 

      const results:Task[] = await tasksService.getAllTasks(); // Call actual tasksService function

      expect(mockRepository.find).toHaveBeenCalledWith({ // Ensure getAllTasks() uses createdAt: DESC order
        order: {
          createdAt: 'DESC'
        }
      });

      expect(results).toEqual(tasks); // Make sure the returned results from service is same as mock data is same
    });
  });

  describe('getTaskById', () => { // getTaskById() unit test
    it('It should return a task by id', async () => {
      const task:Task = { // Create mock task
        id: 1,
        title: 'Title 1',
        text: 'Text 1',
        completed: false
      };

      mockRepository.findOneBy.mockResolvedValue(task); // Tell mock database to return the mock task data. mockResolvedValue() means return a Promise mock object

      const result:Task = await tasksService.getTaskById(task.id); // Call actual tasksService function

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: task.id }); // Make sure repository TypeORM search for the task by id
      expect(result).toEqual(task); // Make sure returned results same as mock data
    });

    it('It should throw an error when no task found', async () => {
      const task = null; // 

      mockRepository.findOneBy.mockResolvedValue(task);

      await expect(tasksService.getTaskById(1)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('createTask', () => {
    it('It should create a task', async () => {
      const createTaskDto:CreateTaskDto = {
        title: 'Title 1',
        text: 'Text 1'
      };

      const createdTask = {
        title: 'Title 1',
        text: 'Text 1',
        completed: false
      }

      mockRepository.create.mockReturnValue({
        ...createTaskDto,
        completed: false
      });

      mockRepository.save.mockResolvedValue(createdTask);

      const result:Task = await tasksService.createTask(createTaskDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        completed: false
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...createTaskDto,
        completed: false
      });
      expect(result).toEqual(createdTask);
    });

    it('Save to database failed', async () => {
      const createTaskDto:CreateTaskDto = {
        title: 'Title 1',
        text: 'Text 1'
      };

      mockRepository.create.mockReturnValue({
        ...createTaskDto,
        completed: false
      });

      mockRepository.save.mockRejectedValue(new Error('Database down'));

      await expect(tasksService.createTask(createTaskDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        completed: false
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('It should update a task', async () => {
      const task = {
        title: 'Title 1',
        text: 'Text 1',
        completed: false,
      };

      const updateTaskDto:UpdateTaskDto = {
        completed: true
      };

      const updatedTask = {
        title: 'Title 1',
        text: 'Text 1',
        completed: true
      }

      mockRepository.findOneBy.mockResolvedValue(task);

      mockRepository.save.mockResolvedValue(updatedTask);

      const result:Task = await tasksService.updateTask(1, updateTaskDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(mockRepository.save).toHaveBeenCalledWith({
        title: 'Title 1',
        text: 'Text 1',
        completed: true
      });
      expect(result).toEqual(updatedTask);
    });

    it('It should reject empty tasks', async () => {
      const task = null;
      const updateTaskDto = {
        title: 'Title 1',
        text: 'Text 2'
      };

      mockRepository.findOneBy.mockResolvedValue(task);

      await expect(tasksService.updateTask(1, updateTaskDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('It should delete a task', async () => {
      const task:Task = {
        id: 1,
        title: 'Title 1',
        text: 'Text 1',
        completed: true,
        createdAt: new Date('2026-09-29T12:00:00Z'),
        updatedAt: new Date('2026-09-29T12:00:00Z')
      };

      mockRepository.findOneBy.mockResolvedValue(task);

      mockRepository.remove.mockResolvedValue(task);

      const result:void = await tasksService.deleteTask(task.id);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(mockRepository.remove).toHaveBeenCalledWith(task);
      expect(result).toEqual(undefined);
    });

    it('It should throw an error if task is not found', async () => {
      const task = null;
      
      mockRepository.findOneBy.mockResolvedValue(task);
      
      await expect(tasksService.deleteTask(1)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
