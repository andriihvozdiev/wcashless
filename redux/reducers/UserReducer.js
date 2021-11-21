const defaultState = {
  jwt: null,
  user: null,
  role: null,
  business: null,
  businessMember: null,
};

const UserReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'USER_JWT_SAVE': {
      return {
        ...state,
        ...{ jwt: action.payload.jwt, user: action.payload.user },
      };
    }
    case 'USER_SAVE': {
      return {
        ...state,
        ...{ user: action.payload.user },
      };
    }
    case 'ACCOUNT_SAVE': {
      const updatedUser = { ...state.user, account: action.payload.account };
      return {
        ...state,
        ...{ user: updatedUser }
      };
    }
    case 'JWT_SAVE': {
      return {
        ...state,
        ...{ jwt: action.payload.jwt }
      }
    }
    case 'ROLE_SAVE': {
      return {
        ...state,
        ...{
          role: {
            role: action.payload.role,
            position: action.payload.position
          }
        }
      }
    }
    case 'BUSINESS_SAVE': {
      return {
        ...state,
        ...{ business: action.payload.business }
      }
    }
    case 'BUSINESS_MEMBER_SAVE': {
      return {
        ...state,
        ...{ businessMember: action.payload.businessMember }
      }
    }
    case 'USER_LOGOUT': {
      return defaultState;
    }

    default:
      return defaultState;
  }
};

export default UserReducer;