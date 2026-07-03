export const parseUserAgent = (userAgent = '') => {
  const ua = userAgent.toLowerCase();

  let browser = 'unknown';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/')) browser = 'Chrome';
  else if (ua.includes('firefox/')) browser = 'Firefox';
  else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';

  let operatingSystem = 'unknown';
  if (ua.includes('iphone') || ua.includes('ipad')) operatingSystem = 'iOS';
  else if (ua.includes('android')) operatingSystem = 'Android';
  else if (ua.includes('windows')) operatingSystem = 'Windows';
  else if (ua.includes('mac os')) operatingSystem = 'macOS';
  else if (ua.includes('linux')) operatingSystem = 'Linux';

  let deviceType = 'desktop';
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    deviceType = 'mobile';
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'tablet';
  }

  return { browser, operatingSystem, deviceType };
};

export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};
