
const ENV = {
  dev: {
    // apiUrl: 'https://7l80vgh195.execute-api.us-east-1.amazonaws.com/dev',
    apiUrl: 'https://38br8h6mtb.execute-api.us-east-1.amazonaws.com/prod',
    businessBaseUrl: 'https://api.wcashless.com/api'
  },
  prod: {
    apiUrl: 'https://38br8h6mtb.execute-api.us-east-1.amazonaws.com/prod',
    // apiUrl: 'https://7l80vgh195.execute-api.us-east-1.amazonaws.com/dev',
    businessBaseUrl: 'https://api.wcashless.com/api'
  }
};

const getEnvVars = () => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.

  if (__DEV__) {
    return ENV.dev;
  } else {
    return ENV.prod;
  }
};

export default getEnvVars;