import BusinessApiService from './businessApiService';
import getEnvVars from '../environment';
import ZapierService from './ZapierService';

const { apiUrl, businessBaseUrl } = getEnvVars();

export const businessApiService = new BusinessApiService({
  apiBase: businessBaseUrl
});

export const zapierService = new ZapierService();
