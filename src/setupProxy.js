const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/solanabeach',
    createProxyMiddleware({
      target: 'https://api.solanabeach.io/v1',
      changeOrigin: true,
      pathRewrite: {
        '^/api/solanabeach': '',
      },
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
    })
  );
};
