require('dotenv').config();

const config = {
  port: process.env.PORT || 10000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'ciwu-default-dev-secret-change-now',
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    baseURL: 'https://api.openai.com/v1'
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    pricePlus: process.env.STRIPE_PRICE_PLUS || '',
    pricePro: process.env.STRIPE_PRICE_PRO || ''
  },
  
  ncbi: {
    apiKey: process.env.NCBI_API_KEY || '',
    baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || ''
  },
  
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || ''
  },
  
  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phone: process.env.TWILIO_PHONE || ''
  },
  
  isConfigured: function() {
    return {
      openai: !!this.openai.apiKey,
      stripe: !!this.stripe.secretKey,
      ncbi: !!this.ncbi.apiKey,
      mongodb: !!this.mongodb.uri,
      sendgrid: !!this.sendgrid.apiKey,
      twilio: !!this.twilio.sid
    };
  }
};

module.exports = config;
