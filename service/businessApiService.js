import axios from 'axios';
import * as R from 'ramda';

import { store } from '../redux/Store';
import { saveJwt } from '../redux/actions/UserActions';

const httpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
};

class BusinessApiService {
  constructor({ apiBase }) {
    this.apiBase = apiBase;
    this.api = axios.create({
      baseURL: apiBase,
    });
  }

  handleResponse = (response) => {
    const { data, status } = response;
    const { handleRequestError } = this;

    if (status >= 200 && status < 300) {
      return {
        data,
        status,
        error: false
      };
    }

    return handleRequestError(response);
  };

  handleRequestError = (err) => {
    if (err.status == 401) {
      saveJwt('');
    }
    const status = R.pathOr(httpStatus.BAD_REQUEST, ['response', 'status'], err);
    const error = {
      status: err.status,
      error: true,
      data: R.pathOr({ errors: err || { GenericErrors: ['The service cannot be reached at this moment'] } }, ['response', 'data'], err),
      networkError: err.message === 'Network Error',
      unauthorized: status === httpStatus.UNAUTHORIZED,
      conflict: err.error === httpStatus.CONFLICT,
    };
    return error;
  };

  request = async (url, method, body, options = {}) => {
    const { handleResponse, handleRequestError } = this;
    console.log(method, this.apiBase + url);

    const opts = { ...options };
    opts.headers = opts.headers || { 'User-Agent': 'BraceletLinker' };
    opts.headers = { 'User-Agent': 'BraceletLinker', ...opts.headers };
    try {
      const response = (method === 'get' || method === 'delete') ? await this.api[method](url, opts) : await this.api[method](url, body, opts);
      return handleResponse(response);
    } catch (err) {
      return handleRequestError(err);
    }
  };

  requestWithAuth = async (url, method, body = {}, options = {}) => {
    const { request, tokenService } = this;

    options = { ...options };
    options.headers = options.headers || { Authorization: 'Bearer ' + store.getState().jwt };

    return request(url, method, body, options);
  };

  createBusinessAccount = async (data) => {
    return await this.request(`/auth/local/register`, `post`, data);
  }

  loginUser = async (email, password) => {
    return await this.request('/auth/local', 'post', {
      identifier: email,
      password: password,
    });
  }

  getUser = async () => {
    return await this.requestWithAuth(`/users/me`, 'get');
  }

  forgotPassword = async (email) => {
    return await this.request('/auth/forgot-password', 'post', {
      email
    });
  }

  resetPassword = async (password, passwordConfirmation, code) => {
    return await this.request('/auth/reset-password', 'post', {
      password,
      passwordConfirmation,
      code
    });
  }

  getAccountDevices = async () => {
    return await this.requestWithAuth('/accounts/devices', 'get');
  }

  setAccountDevice = async (name, type) => {
    return await this.requestWithAuth('/accounts/devices', 'post', {
      name,
      type
    });
  }

  getCustomerAccount = async (email) => {
    return await this.requestWithAuth(`/accounts?filters[email][$eq]=${email}&filters[type][$eq]=Customer&populate=bracelets,bracelets.business,wallet`, 'get');
  }

  updateAccount = async (id, data) => {
    return await this.requestWithAuth(`/accounts/${id}`, 'put', data);
  }

  createBusiness = async (name) => {
    return await this.requestWithAuth('/businesses', 'post', {
      name
    });
  }

  updateBusiness = async (id, data) => {
    return await this.requestWithAuth(`/businesses/${id}`, 'put', data);
  }

  getBusinessInfo = async () => {
    return await this.requestWithAuth('/business-members/joined', 'get');
  }

  getBusinessMembers = async (businessId) => {
    return await this.requestWithAuth(`/business-members?populate=account, account.profilePicture, business, business_site&filters[business][id][$eq]=${businessId}`, 'get');
  }

  getBusiness = async (businessId) => {
    return await this.requestWithAuth(`/businesses/${businessId}?populate=photo`, 'get');
  }

  updateBusinessMember = async (memberId, params) => {
    return await this.requestWithAuth(`/business-members/${memberId}`, 'put', { data: params });
  }

  deleteBusinessMember = async (memberId) => {
    return await this.requestWithAuth(`/business-members/${memberId}`, 'delete');
  }

  createBusinessSite = async (params) => {
    return await this.requestWithAuth('/business-sites', 'post', {
      data: params
    });
  }

  getBusinessSite = async(id) => {
    return await this.requestWithAuth(`/business-sites/${id}`, 'get');
  }

  updateBusinessSite = async (id, params) => {
    return await this.requestWithAuth(`/business-sites/${id}`, 'put', { data: params });
  }

  getBusinessSites = async (businessId, type) => {
    return await this.requestWithAuth(`/businesses/${businessId}/sites/${type}`, 'get');
  }

  getBusinessSitesInBusiness = async (businessId) => {
    return await this.requestWithAuth(`/businesses/${businessId}/sites`, 'get');
  }

  deleteBusinessSite = async (id) => {
    return await this.requestWithAuth(`/business-sites/${id}`, 'delete');
  }

  registerBracelet = async (params) => {
    return await this.requestWithAuth('/bracelets', 'post', params);
  }

  getBracelet = async (braceletId) => {
    return await this.requestWithAuth(`/bracelets/${braceletId}`, 'get');
  }

  deleteBracelet = async (braceletId) => {
    return await this.requestWithAuth(`/bracelets/${braceletId}`, 'delete');
  }

  addBalance = async (params) => {
    return await this.requestWithAuth('/payment/addBalance', 'post', params);
  }

  receivePayment = async (params) => {
    return await this.requestWithAuth('/payment/transferC2B', 'post', params);
  }

  refundPayment = async (params) => {
    return await this.requestWithAuth('/payment/transferB2C', 'post', params);
  }

  refundTransaction = async (transactionId, params) => {
    return await this.requestWithAuth(`/transactions/${transactionId}/refund`, 'post', params);
  }

  getBusinessTransactions = async (businessId, page = 0, pageSize = 25, from = null, to = null) => {
    var params = '';
    if (from) { params = `&from=${from}` };
    if (to) { params = `${params}&to=${to}` };
    const paginationParam = `pagination[withCount]=true&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    return await this.requestWithAuth(
      `businesses/${businessId}/transactions?${paginationParam}${params}`,
      'get'
    );
  }

  addTransaction = async (params) => {
    return await this.requestWithAuth('/transactions', 'post', {
      data: params
    });
  }

  getTransaction = async (transactionId) => {
    return await this.requestWithAuth(`/transactions/${transactionId}?populate=refer_tx,author,business.wallet,fromAccount,toAccount`, 'get');
  }

  getStatistics = async (busineId, from, to = null) => {
    var params = `from=${from}`;
    if (to) {
      params = `${params}&to=${to}`;
    }
    return await this.requestWithAuth(`/transactions/analytics/business/${busineId}?${params}`, 'get');
  }

  updateTransaction = async (id, params) => {
    return await this.requestWithAuth(`/transactions/${id}`, 'put', { data: params });
  }

  /** Super Admin start */
  getAllBusinessMembers = async (page = 0, pageSize = 25) => {
    return await this.requestWithAuth(
      `/business-members?populate=business,account.profilePicture&pagination[withCount]=true&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`,
      'get'
    );
  }

  getTransactions = async (page = 0, pageSize = 25, from = null, to = null) => {

    const pagination = `pagination[withCount]=true&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    const sort = `sort=createdAt:desc`;
    var filters = '';
    if (from) {
      filters = `&filters[createdAt][$gte]=${from}`;
    }

    if (to) {
      filters = `${filters}&filters[createdAt][$lte]=${to}`
    }
    return await this.requestWithAuth(
      `/transactions?populate=business&${pagination}&${sort}${filters}`,
      'get'
    );
  }

  getAllBusiness = async (page = 0, pageSize = 25) => {
    return await this.requestWithAuth(
      `/businesses?populate=wallet,photo&pagination[withCount]=true&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=name:asc`,
      'get'
    );
  }

  getAllBusinessSites = async (type, page = 0, pageSize = 25) => {
    return await this.requestWithAuth(
      `/business-sites?populate=photo,business&filters[type][$eq]=${type}&pagination[withCount]=true&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`,
      'get'
    );
  }

  // get avg rate and reviews with pagination
  getReviews = async (businessSiteId, page = 0, pageSize = 25) => {
    return await this.requestWithAuth(
      `/business-sites/${businessSiteId}/reviews?withCount=true&page=${page}&pageSize=${pageSize}`,
      'get'
    )
  }

  /** Super Admin end */

  // For manage file
  uploadFile = async (file) => {
    const { handleRequestError } = this;

    var formdata = new FormData();
    formdata.append("files", file);

    var requestOptions = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + store.getState().jwt,

      },
      body: formdata,
      redirect: 'follow'
    };

    try {
      const result = await fetch("https://api.wcashless.com/api/upload", requestOptions)
      const response = await result.json();

      if (response.error) {
        handleRequestError(response);
      } else {
        const uploadedImage = response['0'];
        return {
          error: false,
          data: {
            id: uploadedImage.id,
            name: uploadedImage.name,
            url: uploadedImage.url,
            width: uploadedImage.width,
            height: uploadedImage.height
          }
        }
      }
    } catch (err) {
      return handleRequestError(err);
    }
  }

  getImageFile = async (id) => {
    return await this.requestWithAuth(`/api/upload/files/${id}`, 'get');
  }

}

export default BusinessApiService;
