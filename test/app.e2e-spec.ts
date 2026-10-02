import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { App } from 'supertest/types.js';
import { AllExceptionFilter } from '../src/common/exception/all-exception-filter.js';
import { Repository } from 'typeorm';
import { Task } from '../src/tasks/entity/task.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let tasksRepository: Repository<Task>;

  beforeAll(async () => {
    if(process.env.NODE_ENV !== 'test'){
      throw new Error('E2E test must run with NODE_ENV=test');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1'
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }));
  
    app.useGlobalFilters(new AllExceptionFilter());
    
    await app.init();

    tasksRepository = app.get<Repository<Task>>(getRepositoryToken(Task));
  });

  beforeEach(async () => {
    await tasksRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/task/ (GET)', () => {
    it('It return all tasks as normal', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 2',
          text: 'Text 2'
        })
        .expect(201);

      const task = await request(app.getHttpServer())
        .get('/api/v1/task/')
        .expect(200);
      
      expect(task.body).toHaveLength(2);
      expect(task.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Title 1',
            text: 'Text 1',
            completed: false
          }),

          expect.objectContaining({
            title: 'Title 2',
            text: 'Text 2',
            completed: false
          })
        ])
      );
    });

    it('It return nothing if there is no task', async () => {
      const task = await request(app.getHttpServer())
        .get('/api/v1/task/')
        .expect(200);

      expect(task.body).toHaveLength(0);
      expect(task.body).toEqual([]);
    })
  });

  describe('/api/v1/task/:id (GET)', () => {
    it('It return a single task as normal', async () => {
      const createdTask = await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201);

      const task = await request(app.getHttpServer())
        .get(`/api/v1/task/${createdTask.body.id}`)
        .expect(200);

      expect(task.body).toMatchObject({
        title: 'Title 1',
        text: 'Text 1',
        completed: false
      });
    });

    it('It throw error if id is invalid', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/task/abc')
        .expect(400);
    });

    it('It throw error if no task is found', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/task/999999')
        .expect(404);
    });
  });

  describe('/api/v1/task/ (POST)', () => {
    it('It should create tasks normally', async () => {
      const task = await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201);

      expect(task.body).toMatchObject({
        title: 'Title 1',
        text: 'Text 1',
        completed: false
      });
    });

    it('It throws error if text field is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: ''
        })
        .expect(400);
    });

    it('It throws error if necessary field is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1'
        })
        .expect(400);
    });

    it('It throws error if invalid field', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: true,
          text: 'Text 1'
        })
        .expect(400);
    })
    
    it('It throws error if unknown property', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1',
          idk: 'hi'
        })
        .expect(400);
    });
  });

  describe('/api/v1/task/:id (PATCH)', () => {
    it('It updates a task', async () => {
      const updatedTask = await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201);

      const task = await request(app.getHttpServer())
        .patch(`/api/v1/task/${updatedTask.body.id}`)
        .send({
          completed: true
        })
        .expect(200);
      
      expect(task.body.completed).toEqual(true)
      expect(task.body).toMatchObject({
        title: 'Title 1',
        text: 'Text 1',
        completed: true
      });
    });

    it('It throws error if task is not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/task/999999')
        .send({
          completed: true
        })
        .expect(404);
    });

    it('It throws error if empty fields', async () => {
      const updatedTask = await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201)

      await request(app.getHttpServer())
        .patch(`/api/v1/task/${updatedTask.body.id}`)
        .send({
          title: ''
        })
        .expect(400);
    });

    it('It throws error if invalid fields', async () => {
      const updatedTask = await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/task/${updatedTask.body.id}`)
        .send({
          completed: 3
        })
        .expect(400);
    });

    it('It throw error if id is invalid', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/task/abc')
        .expect(400);
    });

    it('It throws error if unknown fields', async () => {
      const updatedTask = await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/task/${updatedTask.body.id}`)
        .send({
          invalidField: true
        })
        .expect(400);
    });
  });

  describe('/api/v1/task/:id (DELETE)', () => {
    it('It deletes task as usual', async () => {
      const task = await request(app.getHttpServer())
        .post('/api/v1/task/')
        .send({
          title: 'Title 1',
          text: 'Text 1'
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/task/${task.body.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/v1/task/${task.body.id}`)
        .expect(404);
    });

    it('It throw error if id is invalid', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/task/abc')
        .expect(400);
    });

    it('It throws an error if task is not found', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/task/999999')
        .expect(404);
    });
  });
});
