import { ApiResponse } from '../utils/response.js';
import * as urlService from '../services/url.service.js';
import * as analyticsService from '../services/analytics.service.js';
import { getOrCreateVisitorId } from '../utils/visitor.js';
import { parseUserAgent, getClientIp } from '../utils/userAgent.js';

export const createUrl = async (req, res) => {
  const url = await urlService.createShortUrl(req.user.id, req.body);
  res.status(201).json(ApiResponse.success(url, 'Short URL created'));
};

export const listUrls = async (req, res) => {
  const urls = await urlService.listUrls(req.user.id);
  res.json(ApiResponse.success(urls, 'URLs retrieved'));
};

export const deleteUrl = async (req, res) => {
  await urlService.deleteUrl(req.user.id, req.params.id);
  res.json(ApiResponse.success({}, 'URL deleted'));
};

export const getUrlAnalytics = async (req, res) => {
  const analytics = await analyticsService.getAnalytics(req.user.id, req.params.id);
  res.json(ApiResponse.success(analytics, 'Analytics retrieved'));
};

export const redirect = async (req, res) => {
  const url = await urlService.resolveShortUrl(req.params.shortCode);
  const visitorId = getOrCreateVisitorId(req);
  const { browser, operatingSystem, deviceType } = parseUserAgent(req.headers['user-agent']);

  await urlService.enqueueAnalytics(url.id, {
    visitorId,
    referrer: req.headers.referer || req.headers.referrer || null,
    browser,
    operatingSystem,
    deviceType,
    ipAddress: getClientIp(req),
    country: 'unknown',
  });

  res.redirect(302, url.original_url);
};
