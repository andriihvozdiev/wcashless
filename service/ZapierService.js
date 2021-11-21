/** Zapier hooks */

class ZapierService {

  // wcashless B2B welcome & B2B User registration
  // https://zapier.com/editor/157891732/published/157891732
  welcomeB2BRegistration = async (params) => {
    this.sendZapierWebhook('https://hooks.zapier.com/hooks/catch/10531013/bao4oi4/', params);
  }

  // Enroll wcashless member to PASSKIT
  // https://zapier.com/editor/135952339/published/135952339
  createPasskit = async (params) => {
    this.sendZapierWebhook('https://hooks.zapier.com/hooks/catch/10531013/btj7sp9/', params);
  }

  // Send Wristband pairing details to wcashless user
  sendPairingDetails = async (params) => {
    this.sendZapierWebhook('https://hooks.zapier.com/hooks/catch/10531013/b9b3o1q/silent/', params);
  }

  // Transaction details wcashless
  // https://zapier.com/editor/154281415/published/154281415
  sendTransactionDetailZapier = async (params) => {
    this.sendZapierWebhook('https://hooks.zapier.com/hooks/catch/10531013/bzpcdpq/', params);
  }

  // Update Traveler Balance ON SPEND for Passkit
  // https://zapier.com/editor/141711248/published/141711248
  updateBalanceForPasskit = async (params) => {
    this.sendZapierWebhook('https://hooks.zapier.com/hooks/catch/10531013/b1593ka/', params);
  }


  sendZapierWebhook = (url, jsonParams) => {
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonParams)
    });
  }
}

export default ZapierService;
