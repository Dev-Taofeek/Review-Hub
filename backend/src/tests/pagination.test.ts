import { Request } from 'express';
import { getPagination } from '../utils/pagination';

function makeReq(query: Record<string, string> = {}): Request {
  return { query } as unknown as Request;
}

describe('getPagination', () => {
  test('returns defaults when no query params provided', () => {
    const result = getPagination(makeReq());
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  test('parses valid page and limit', () => {
    const result = getPagination(makeReq({ page: '3', limit: '10' }));
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(20);
  });

  test('calculates offset correctly', () => {
    const result = getPagination(makeReq({ page: '5', limit: '15' }));
    expect(result.offset).toBe(60);
  });

  test('enforces minimum page of 1', () => {
    expect(getPagination(makeReq({ page: '0' })).page).toBe(1);
    expect(getPagination(makeReq({ page: '-5' })).page).toBe(1);
  });

  test('treats limit=0 as unprovided (falls back to default 20)', () => {
    // parseInt('0') = 0 which is falsy, so the || 20 default kicks in
    expect(getPagination(makeReq({ limit: '0' })).limit).toBe(20);
  });

  test('enforces minimum limit of 1 for negative values', () => {
    // parseInt('-10') = -10, Math.max(1, -10) = 1
    expect(getPagination(makeReq({ limit: '-10' })).limit).toBe(1);
  });

  test('enforces maximum limit of 50', () => {
    expect(getPagination(makeReq({ limit: '100' })).limit).toBe(50);
    expect(getPagination(makeReq({ limit: '51' })).limit).toBe(50);
  });

  test('handles non-numeric strings gracefully', () => {
    const result = getPagination(makeReq({ page: 'abc', limit: 'xyz' }));
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  test('handles floating point input by truncating', () => {
    const result = getPagination(makeReq({ page: '2.9', limit: '10.7' }));
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  test('page 1 always has offset 0', () => {
    const result = getPagination(makeReq({ page: '1', limit: '50' }));
    expect(result.offset).toBe(0);
  });
});
