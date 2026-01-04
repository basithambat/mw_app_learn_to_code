import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Will Creation E2E', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let willId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should send OTP', () => {
      return request(app.getHttpServer())
        .post('/auth/otp/send')
        .send({ phone: '+919876543210' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should verify OTP and get token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/otp/verify')
        .send({ phone: '+919876543210', otp: '123456' })
        .expect(200);

      authToken = response.body.accessToken;
      userId = response.body.user.id;
      expect(authToken).toBeDefined();
    });
  });

  describe('Will Creation Flow', () => {
    it('should create a new will', async () => {
      const response = await request(app.getHttpServer())
        .post('/wills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Test Will',
          personalLaw: 'HINDU',
          previousWillExists: false,
        })
        .expect(201);

      willId = response.body.id;
      expect(willId).toBeDefined();
    });

    it('should update basic info', () => {
      return request(app.getHttpServer())
        .patch(`/wills/${willId}/basic-info`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Test User',
          gender: 'MALE',
          dateOfBirth: '1980-01-01',
          maritalStatus: 'MARRIED',
          religionLabel: 'Hindu',
          personalLaw: 'HINDU',
        })
        .expect(200);
    });

    it('should add a family member', () => {
      return request(app.getHttpServer())
        .post(`/wills/${willId}/people`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Spouse Name',
          relationship: 'SPOUSE',
          gender: 'FEMALE',
          dateOfBirth: '1982-05-15',
        })
        .expect(201);
    });

    it('should create inheritance scenario', () => {
      return request(app.getHttpServer())
        .post(`/wills/${willId}/inheritance/scenarios`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'USER_DIES_FIRST',
          allocationJson: {
            allocations: [
              { personId: 'person_id', percentage: 100 },
            ],
          },
        })
        .expect(201);
    });

    it('should assign executor', () => {
      return request(app.getHttpServer())
        .post(`/wills/${willId}/executor`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personId: 'person_id',
        })
        .expect(201);
    });

    it('should add witnesses', async () => {
      // Add first witness
      await request(app.getHttpServer())
        .post(`/wills/${willId}/witnesses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Witness 1',
          email: 'witness1@example.com',
          phone: '+919876543211',
        })
        .expect(201);

      // Add second witness
      return request(app.getHttpServer())
        .post(`/wills/${willId}/witnesses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Witness 2',
          email: 'witness2@example.com',
          phone: '+919876543212',
        })
        .expect(201);
    });

    it('should accept declaration', () => {
      return request(app.getHttpServer())
        .post(`/wills/${willId}/declaration`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accepted: true,
        })
        .expect(201);
    });

    it('should upload signature', () => {
      return request(app.getHttpServer())
        .post(`/wills/${willId}/signature`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'DRAWN',
          drawnSvg: '<svg>...</svg>',
        })
        .expect(201);
    });

    it('should generate PDF', () => {
      return request(app.getHttpServer())
        .post(`/wills/${willId}/pdf/generate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.fileUrl).toBeDefined();
          expect(res.body.pdfVersion).toBeDefined();
        });
    });
  });
});
