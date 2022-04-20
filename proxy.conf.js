const PROXY_CONFIG = [
 {
      context: [
         // "/receivingParameters"
      ],
      target: "http://localhost:3000",
      secure: false,
      changeOrigin: true,
      logLevel: "debug",
      autoRewrite: true
  }
]

module.exports = PROXY_CONFIG;

