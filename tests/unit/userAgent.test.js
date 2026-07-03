import { parseUserAgent, getClientIp } from '../../src/utils/userAgent.js';

describe('parseUserAgent', () => {
  it('detects Chrome on Windows desktop', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(parseUserAgent(ua)).toEqual({
      browser: 'Chrome',
      operatingSystem: 'Windows',
      deviceType: 'desktop',
    });
  });

  it('detects Safari on iOS mobile', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    expect(parseUserAgent(ua)).toEqual({
      browser: 'Safari',
      operatingSystem: 'iOS',
      deviceType: 'mobile',
    });
  });
});

describe('getClientIp', () => {
  it('reads x-forwarded-for header', () => {
    const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, ip: '9.9.9.9' };
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to req.ip', () => {
    const req = { headers: {}, ip: '9.9.9.9' };
    expect(getClientIp(req)).toBe('9.9.9.9');
  });
});
