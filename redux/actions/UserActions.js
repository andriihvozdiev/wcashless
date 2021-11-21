import { store } from '../Store';

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
export const saveUserJWT = (jwt, user) => {
  store.dispatch({
    type: 'USER_JWT_SAVE',
    payload: {
      jwt,
      user
    },
  });
};

export const saveUser = (user) => {
  store.dispatch({
    type: 'USER_SAVE',
    payload: {
      user,
    },
  });
};

export const saveAccount = (account) => {
  store.dispatch({
    type: 'ACCOUNT_SAVE',
    payload: {
      account,
    },
  });
};

export const saveJwt = (jwt) => {
  store.dispatch({
    type: 'JWT_SAVE',
    payload: { jwt }
  });
}

export const saveRole = (role, position) => {
  store.dispatch({
    type: 'ROLE_SAVE',
    payload: {
      role, position
    },
  });
};

export const saveBusinessMember = (businessMember) => {
  store.dispatch({
    type: 'BUSINESS_MEMBER_SAVE',
    payload: {
      businessMember
    },
  });
};

export const saveBusiness = (business) => {
  store.dispatch({
    type: 'BUSINESS_SAVE',
    payload: {
      business,
    },
  });
};

export const logoutUser = () => {
  store.dispatch({ type: 'USER_LOGOUT' });
};