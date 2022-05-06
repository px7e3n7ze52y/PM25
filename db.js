const config = {
  user: "nattawat",
  password: "1234",
  database: "pm25",
  server: "localhost",
  options: {
    // cryptoCredentialsDetails: {
    //     minVersion: 'TLSv1'
    // },
    trustedConnection: true,
    trustServerCertificate: true,
  },
  port: 1433,
};

module.exports = config;
