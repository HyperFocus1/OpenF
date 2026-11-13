// La API Jersey se despliega como open_f.war en Tomcat (puerto 8080).
const context = (process.env.OPENF_API_CONTEXT ?? '/open_f/api').replace(/\/$/, '');

export default {
  '/api/**': {
    target: process.env.OPENF_API_TARGET ?? 'http://localhost:8080',
    changeOrigin: false,
    rewrite: (path) => path.replace(/^\/api(?=\/|$)/, context),
  },
};
