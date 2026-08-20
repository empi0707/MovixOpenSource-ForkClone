// PM2 config per clone — path phụ thuộc domain deploy, không dùng chung được.
// Copier ce fichier en ecosystem.config.cjs (gitignored) puis remplacer
// /www/wwwroot/example.com par le vrai chemin de déploiement :
//   cp ecosystem.config.example.cjs ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "movix-frontend",
      cwd: "/www/wwwroot/example.com",
      script: "server/index.js",
      env: { PORT: 3001 },
    },
    {
      name: "movix-mainapi",
      cwd: "/www/wwwroot/example.com/API/Mainapi",
      script: "server.js",
      exec_mode: "fork", // self-cluster (Node cluster module), ne pas laisser PM2 clusteriser par-dessus
      instances: 1,
    },
    {
      name: "movix-proxiesembed",
      cwd: "/www/wwwroot/example.com/API/proxiesembed",
      script: "server.py",
      interpreter: "/www/wwwroot/example.com/API/proxiesembed/venv/bin/python3",
    },
    {
      name: "movix-bypass403",
      cwd: "/www/wwwroot/example.com/API/miscs",
      script: "bypass403.py",
      interpreter: "/www/wwwroot/example.com/API/miscs/venv/bin/python3",
    },
  ],
};
