import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "../src/tasks/task.service.js"
import { Repository } from "typeorm";
import { Task } from "../src/tasks/entity/task.entity.js";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TasksModule } from "../src/tasks/task.module.js";
import { NotFoundException } from "@nestjs/common";
import { configSchema } from "../src/config/configuration.js";

describe('Tasks Integration Test', () => {
    let tasksService: TasksService; // Declare TaskService
    let moduleRef: TestingModule; // Declare TestingModule for setting up our app module as mock module
    let tasksRepository: Repository<Task>; // Declare our actual repository which connects between service & database

    beforeAll(async () => { // Before all test starts set up mock module first
        if(process.env.NODE_ENV !== 'test'){ // Fetch NODE_ENV from npm, if its not test somehow throw error and stop testing & messing with prod/dev database
           throw new Error('E2E test must run with NODE_ENV=test');
        }
        moduleRef = await Test.createTestingModule({ // Create Mock Module that resembles same as actual AppModule
            imports: [
                ConfigModule.forRoot({ // List only .env.test so that NestJS/Config only uses .env.test config
                    envFilePath: '.env.test',
                    isGlobal: true,
                    validationSchema: configSchema // Use Zod Schema earlier for validating config type
                }),
                TypeOrmModule.forRootAsync({ // Setting up TypeORM for database later
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => ({
                        type: 'postgres',
                        host: config.getOrThrow<string>('DB_HOST'),
                        port: config.getOrThrow<number>('DB_PORT'),
                        username: config.getOrThrow<string>('DB_USERNAME'),
                        password: config.getOrThrow<string>('DB_PASSWORD'),
                        database: config.getOrThrow<string>('DB_NAME'),
                        entities: [Task],
                        synchronize: false,
                        dropSchema: false // Make sure existing database tables are not deleted
                    })
                }),
                TasksModule
            ]
        }).compile();

        tasksService = moduleRef.get<TasksService>(TasksService);
        tasksRepository = moduleRef.get<Repository<Task>>(getRepositoryToken(Task)); // Get Repository Token with Task Entity so that it persists even after typescript compilation
    });

    beforeEach(async () => {
        await tasksRepository.clear(); // Before each test, clear all data records in testing db
    });

    afterAll(async () => {
        await moduleRef.close(); // After all tests done, close the mock module aka close the app
    });

    describe('getAllTasks', () => { // Test GetAllTask() function. In integration test, we run the actual flow of how our app logic would work internally, without calling the API route yet. That's for e2e. But integration test use real db so no mock repository or service
        it('It get all tasks normally', async () => {
            const task1:Task = await tasksService.createTask({
                title: 'Title 1',
                text: 'Text 1'
            });

            const task2:Task = await tasksService.createTask({
                title: 'Title 2',
                text: 'Text 2'
            });

            const fetchedTasks: Task[] = await tasksService.getAllTasks();

            expect(fetchedTasks).toHaveLength(2); // Since we have 2 data entries array length is 2
            expect(fetchedTasks).toEqual( // Go through the array objects and see if it resembles with the 2 data above
                expect.arrayContaining([
                    expect.objectContaining({
                        id: task1.id,
                        title: 'Title 1',
                        text: 'Text 1',
                        completed: false
                    }),

                    expect.objectContaining({
                        id: task2.id,
                        title: 'Title 2',
                        text: 'Text 2',
                        completed: false
                    })
                ])
            );
        });

        it('Expect return none if no tasks found', async () => { // Return no results if no task is found
            const tasks = await tasksService.getAllTasks();
            expect(tasks).toHaveLength(0);
        });
    });

    describe('getTasksById', () => {
        it('It get tasks like normally', async () => {
           const task:Task = await tasksService.createTask({
                title: 'Title 1',
                text: 'Text 1'
           });
           
           expect(task.id).toEqual(expect.any(Number));

           const fetchedTask:Task = await tasksService.getTaskById(task.id);

           expect(fetchedTask).toMatchObject({
                id: task.id,
                title: 'Title 1',
                text: 'Text 1',
                completed: false
           });
        });

        it('It should fail if no task is found', async () => {
            await expect(tasksService.getTaskById(999999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createTask', () => {
        it('It create task', async () => {
            const task:Task = await tasksService.createTask({
                title: 'Title 1',
                text: 'Text 1'
            });

            expect(task).toMatchObject({
                id: task.id,
                title: 'Title 1',
                text: 'Text 1',
                completed: false
            });
        })
    })

    describe('updateTask', () => {
        it('It update tasks normally', async () => {
            const task:Task = await tasksService.createTask({
                title: 'Title 1',
                text: 'Text 1'
            });

            await tasksService.updateTask(task.id, { completed: true });
            
            const updatedTask:Task = await tasksService.getTaskById(task.id);

            expect(updatedTask.id).toEqual(task.id);
            expect(updatedTask.completed).toEqual(true);
            expect(updatedTask).toMatchObject({
                id: task.id,
                title: 'Title 1',
                text: 'Text 1',
                completed: true
            });
        });

        it('It throws an error when updating tasks that are not found', async () => {
            await expect(tasksService.updateTask(999999, { completed: true })).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteTask', () => {
        it('It delete tasks normally', async () => {
            const task:Task = await tasksService.createTask({
                title: 'Title 1',
                text: 'Text 1'
            });

            await tasksService.deleteTask(task.id);

            await expect(tasksService.getTaskById(task.id)).rejects.toThrow(NotFoundException);
        });

        it('It throws an error when no task is found', async () => {
            await expect(tasksService.deleteTask(999999)).rejects.toThrow(NotFoundException);
        });
    });
});