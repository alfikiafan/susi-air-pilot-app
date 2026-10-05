import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

/** Runs the real app against the provided mock data with today = 2026-05-15. */
describe('Pilot API (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  const api = () => request(app.getHttpServer());
  const authed = (path: string) =>
    api().get(path).set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    process.env.TODAY = '2026-05-15';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    const res = await api()
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'susiairtest' });
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth', () => {
    it('issues a bearer token for the pilot account', async () => {
      const res = await api()
        .post('/auth/login')
        .send({ username: 'johndoe', password: 'susiairtest' })
        .expect(200);
      expect(res.body).toMatchObject({ tokenType: 'Bearer' });
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('rejects bad credentials with INVALID_CREDENTIALS', async () => {
      const res = await api()
        .post('/auth/login')
        .send({ username: 'johndoe', password: 'wrong' })
        .expect(401);
      expect(res.body).toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        path: '/auth/login',
      });
      expect(res.body.timestamp).toBeDefined();
    });

    it('validates the login body', async () => {
      const res = await api()
        .post('/auth/login')
        .send({ username: 'johndoe' })
        .expect(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.stringContaining('password')]),
      );
    });

    it.each([
      '/pilot/me',
      '/documents',
      '/flight-hours?from=2026-05-01&to=2026-05-02',
      '/flight-hours/summary',
      '/schedules?year=2026&month=5',
    ])('guards %s', async (path) => {
      const res = await api().get(path).expect(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('rejects a forged token', async () => {
      await api()
        .get('/pilot/me')
        .set('Authorization', `Bearer ${token.slice(0, -2)}xx`)
        .expect(401);
    });
  });

  it('GET /pilot/me returns the profile', async () => {
    const res = await authed('/pilot/me').expect(200);
    expect(res.body).toMatchObject({
      username: 'johndoe',
      name: 'John Doe',
      totalFlightHours: 1444.5,
      today: '2026-05-15',
    });
    expect(res.body.avatarUrl).toMatch(/^https:\/\//);
  });

  describe('GET /flight-hours', () => {
    it('returns one entry per day in the range', async () => {
      const res = await authed(
        '/flight-hours?from=2026-05-14&to=2026-05-16',
      ).expect(200);
      expect(res.body.days).toHaveLength(3);
      expect(res.body.days[1]).toEqual({
        date: '2026-05-15',
        hours: 6.4,
        projected: false,
      });
      expect(res.body.days[2].projected).toBe(true);
    });

    it.each([
      ['from=2026-02-30&to=2026-03-01', 'from must be a valid date'],
      ['from=2026-05-02&to=2026-05-01', 'from must not be after to'],
      ['from=2026-05-01', 'to must be a valid date'],
    ])('rejects %s', async (query, detail) => {
      const res = await authed(`/flight-hours?${query}`).expect(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details.join(' ')).toContain(detail);
    });
  });

  describe('GET /flight-hours/summary', () => {
    it('defaults to 1w and centres the series on today', async () => {
      const res = await authed('/flight-hours/summary').expect(200);
      const { body } = res;
      expect(body).toMatchObject({
        range: '1w',
        today: '2026-05-15',
        windowDays: 7,
        limit: 40,
        yMax: 45,
      });
      expect(body.points).toHaveLength(15);
      expect(body.points[7]).toMatchObject({
        date: '2026-05-15',
        value: 25.2,
        isToday: true,
        projected: false,
      });
    });

    it('computes projected values above the limit', async () => {
      const res = await authed('/flight-hours/summary?range=1w').expect(200);
      const may18 = res.body.points.find(
        (p: { date: string }) => p.date === '2026-05-18',
      );
      expect(may18).toMatchObject({
        value: 42.8,
        projected: true,
        exceedsLimit: true,
      });
      expect(res.body.peak).toBe(44.7);
    });

    it('uses the bounds of the selected range', async () => {
      const res = await authed('/flight-hours/summary?range=1y').expect(200);
      expect(res.body).toMatchObject({
        windowDays: 365,
        limit: 1050,
        yMax: 1200,
      });
    });

    it('returns the four limit cards', async () => {
      const res = await authed('/flight-hours/summary').expect(200);
      expect(
        res.body.cards.map((c: { key: string; hours: number }) => [
          c.key,
          c.hours,
        ]),
      ).toEqual([
        ['daily', 6.4],
        ['weekly', 25.2],
        ['monthly', 87.2],
        ['annual', 1013.8],
      ]);
    });

    it('rejects an unknown range', async () => {
      const res = await authed('/flight-hours/summary?range=2w').expect(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  it('GET /documents computes urgency against today, most urgent first', async () => {
    const res = await authed('/documents').expect(200);
    expect(
      res.body.documents.map(
        (d: { id: string; daysRemaining: number; status: string }) => [
          d.id,
          d.daysRemaining,
          d.status,
        ],
      ),
    ).toEqual([
      ['doc_security', -14, 'expired'],
      ['doc_license', 14, 'soon'],
      ['doc_medical', 27, 'soon'],
      ['doc_recurrent', 152, 'safe'],
      ['doc_ppc', 224, 'safe'],
    ]);
  });

  describe('GET /schedules', () => {
    it('returns one month of entries with the legend', async () => {
      const res = await authed('/schedules?year=2026&month=05').expect(200);
      expect(res.body).toMatchObject({ year: 2026, month: 5 });
      expect(res.body.legend).toHaveLength(10);
      expect(res.body.schedules.length).toBeGreaterThan(0);
      for (const entry of res.body.schedules) {
        expect(entry.duty_date.startsWith('2026-05-')).toBe(true);
        expect(entry.is_complete).toBe(
          entry.count_logbooks === entry.count_schedules,
        );
      }
    });

    it('returns an empty list for a month without data', async () => {
      const res = await authed('/schedules?year=2026&month=1').expect(200);
      expect(res.body.schedules).toEqual([]);
    });

    it.each(['year=2026&month=13', 'year=2026', 'year=abc&month=5'])(
      'rejects %s',
      async (query) => {
        const res = await authed(`/schedules?${query}`).expect(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
      },
    );
  });

  it('returns the standard error shape for unknown routes', async () => {
    const res = await authed('/nope').expect(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      path: '/nope',
    });
  });
});
