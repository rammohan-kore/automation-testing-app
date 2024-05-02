module.exports = {
    apps : [
    {
      name: 'automation-testing-app',
      script: './app.js',
      env: {
        LOG_DIR: '/home/rammohanyadavalli/Documents/logs',
        JAMBONZ_ACCOUNT_SID: "ee3e63a7-f62b-4e27-bc03-82e31f7817fa",
        JAMBONZ_API_KEY: "7dd48ac1-31c9-4438-aa17-f97eb2081e39",
        JAMBONZ_REST_API_BASE_URL: "https://korevg-dev.kore.ai/api/v1",
        JAMBONZ_APPLICATION_SID:"30fcc8e5-d4d9-456b-ab83-840f235609e8",
        CALL_HOOK_BASE_URL: "wss://korevg-dev.kore.ai/automationvoicetesting",
        WEB_SOCKET_SERVER_PORT:'3100',
        SAVG_LISTEN_PORT:'3400',
        LOG_LEVEL:'info'
      }
    }
  ]
  };
  