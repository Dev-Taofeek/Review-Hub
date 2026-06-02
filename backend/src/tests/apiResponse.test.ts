import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';

function makeMockRes() {
  const res = {
    _status: 200,
    _json: null as unknown,
    status(code: number) { this._status = code; return this; },
    json(data: unknown)  { this._json  = data; return this; },
  };
  return res;
}

describe('sendSuccess', () => {
  test('sends 200 with data and success flag', () => {
    const res = makeMockRes();
    sendSuccess(res as any, { id: 1 });
    expect(res._status).toBe(200);
    expect((res._json as any).success).toBe(true);
    expect((res._json as any).data).toEqual({ id: 1 });
  });

  test('includes optional message', () => {
    const res = makeMockRes();
    sendSuccess(res as any, null, 'Created successfully', 201);
    expect(res._status).toBe(201);
    expect((res._json as any).message).toBe('Created successfully');
  });

  test('uses custom status code', () => {
    const res = makeMockRes();
    sendSuccess(res as any, {}, undefined, 201);
    expect(res._status).toBe(201);
  });

  test('handles null data', () => {
    const res = makeMockRes();
    sendSuccess(res as any, null);
    expect((res._json as any).data).toBeNull();
    expect((res._json as any).success).toBe(true);
  });

  test('handles array data', () => {
    const res = makeMockRes();
    sendSuccess(res as any, [1, 2, 3]);
    expect((res._json as any).data).toEqual([1, 2, 3]);
  });
});

describe('sendError', () => {
  test('sends 400 by default with error message', () => {
    const res = makeMockRes();
    sendError(res as any, 'Something went wrong');
    expect(res._status).toBe(400);
    expect((res._json as any).success).toBe(false);
    expect((res._json as any).error).toBe('Something went wrong');
  });

  test('uses custom status code', () => {
    const res = makeMockRes();
    sendError(res as any, 'Not found', 404);
    expect(res._status).toBe(404);
  });

  test('sends 401 for unauthorized', () => {
    const res = makeMockRes();
    sendError(res as any, 'Unauthorized', 401);
    expect(res._status).toBe(401);
    expect((res._json as any).error).toBe('Unauthorized');
  });

  test('sends 500 for server error', () => {
    const res = makeMockRes();
    sendError(res as any, 'Internal error', 500);
    expect(res._status).toBe(500);
  });
});

describe('sendPaginated', () => {
  const data = [{ id: 1 }, { id: 2 }];

  test('sends pagination metadata correctly', () => {
    const res = makeMockRes();
    sendPaginated(res as any, data, 50, 2, 10);
    const json = res._json as any;
    expect(json.success).toBe(true);
    expect(json.data).toEqual(data);
    expect(json.pagination.page).toBe(2);
    expect(json.pagination.limit).toBe(10);
    expect(json.pagination.total).toBe(50);
    expect(json.pagination.totalPages).toBe(5);
  });

  test('hasNext is true when more pages exist', () => {
    const res = makeMockRes();
    sendPaginated(res as any, data, 50, 1, 10);
    expect((res._json as any).pagination.hasNext).toBe(true);
    expect((res._json as any).pagination.hasPrev).toBe(false);
  });

  test('hasPrev is true after first page', () => {
    const res = makeMockRes();
    sendPaginated(res as any, data, 50, 3, 10);
    expect((res._json as any).pagination.hasPrev).toBe(true);
  });

  test('hasNext is false on last page', () => {
    const res = makeMockRes();
    sendPaginated(res as any, data, 20, 2, 10);
    expect((res._json as any).pagination.hasNext).toBe(false);
  });

  test('computes totalPages correctly', () => {
    const res = makeMockRes();
    sendPaginated(res as any, [], 101, 1, 10);
    expect((res._json as any).pagination.totalPages).toBe(11);
  });

  test('returns status 200', () => {
    const res = makeMockRes();
    sendPaginated(res as any, [], 0, 1, 20);
    expect(res._status).toBe(200);
  });

  test('handles empty result set', () => {
    const res = makeMockRes();
    sendPaginated(res as any, [], 0, 1, 20);
    const json = res._json as any;
    expect(json.data).toEqual([]);
    expect(json.pagination.total).toBe(0);
    expect(json.pagination.totalPages).toBe(0);
    expect(json.pagination.hasNext).toBe(false);
    expect(json.pagination.hasPrev).toBe(false);
  });
});
