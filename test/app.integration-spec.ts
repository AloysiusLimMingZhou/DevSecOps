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
    let tasksService: TasksService;
    let moduleRef: TestingModule;
    let tasksRepository: Repository<Task>;

    beforeAll(async () => {
        if(process.env.NODE_ENV !== 'test'){
           throw new Error('E2E test must run with NODE_ENV=test');
        }
        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    envFilePath: '.env.test',
                    isGlobal: true,
                    validationSchema: configSchema
                }),
                TypeOrmModule.forRootAsync({
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
                        dropSchema: false
                    })
                }),
                TasksModule
            ]
        }).compile();

        tasksService = moduleRef.get<TasksService>(TasksService);
        tasksRepository = moduleRef.get<Repository<Task>>(getRepositoryToken(Task));
    });

    beforeEach(async () => {
        await tasksRepository.clear();
    });

    afterAll(async () => {
        await moduleRef.close();   
    });

    describe('getAllTasks', () => {
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

            expect(fetchedTasks).toHaveLength(2);
            expect(fetchedTasks).toEqual(
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

        it('Expect return none if no tasks found', async () => {
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