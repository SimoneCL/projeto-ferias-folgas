const PROXY_CONFIG_embau = [
    {
         context: [
             "/josso",
             "/dts/datasul-rest",
         ],
         target: "http://embau:8680",
         secure: false,
         changeOrigin: true,
         logLevel: "debug",
         autoRewrite: true,
         headers: {
             Authorization: "Basic c3VwZXI6c3N6a0AxMjM=" // super sszk@123
             // Authorization: "Basic MTM6MTM=" // 13 13
         }
     }
 ]

// caraiva:8180
const PROXY_CONFIG_caraiva = [
    {
        context: [
            "/josso",
            "/dts/datasul-rest",
        ],
        target: "https://caraiva:8180",
        secure: false,
        changeOrigin: true,
        logLevel: "debug",
        autoRewrite: true,
        headers: {
            Authorization: "Basic c3VwZXI6c3VwZXJAMTIz"
        }
    }
] 

module.exports = PROXY_CONFIG_caraiva;
