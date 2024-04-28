import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app/app.module';

describe('SignatureController', () => {
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
      role: 0,
      expirationSeconds: 2000,
      meetingNumber: 123456,
    };
    return request(app.getHttpServer())
      .post('/signature')
      .send(requestBody)
      .expect(201);
  });
});
