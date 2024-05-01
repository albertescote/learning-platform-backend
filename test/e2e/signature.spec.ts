import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app/app.module';
import request from 'supertest';

describe.skip('SignatureController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/signature (POST)', () => {
    const requestBody = {
      topic: 'topic-1',
      expirationSeconds: 2000,
    };
    return request(app.getHttpServer())
      .post('/signature')
      .send(requestBody)
      .expect(201);
  });
});
