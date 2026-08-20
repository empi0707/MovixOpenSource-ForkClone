module.exports = {
  apps: [
    {
      name: "movix-frontend",
      cwd: "/www/wwwroot/wiflix.mov",
      script: "server/index.js",
      env: { PORT: 3001 },
    },
    {
      name: "movix-mainapi",
      cwd: "/www/wwwroot/wiflix.mov/API/Mainapi",
      script: "server.js",
      exec_mode: "fork", // self-cluster (Node cluster module), ne pas laisser PM2 clusteriser par-dessus
      instances: 1,
    },
    {
      name: "movix-proxiesembed",
      cwd: "/www/wwwroot/wiflix.mov/API/proxiesembed",
      script: "server.py",
      interpreter: "/www/wwwroot/wiflix.mov/API/proxiesembed/venv/bin/python3",
    },
    {
      name: "movix-bypass403",
      cwd: "/www/wwwroot/wiflix.mov/API/miscs",
      script: "bypass403.py",
      interpreter: "/www/wwwroot/wiflix.mov/API/miscs/venv/bin/python3",
    },
  ],
};
