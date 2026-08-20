module.exports = {
  apps: [
    {
      name: "movix-frontend",
      cwd: "/www/wwwroot/movix",
      script: "server/index.js",
      env: { PORT: 3001 },
    },
    {
      name: "movix-mainapi",
      cwd: "/www/wwwroot/movix/API/Mainapi",
      script: "server.js",
      exec_mode: "fork", // self-cluster (Node cluster module), ne pas laisser PM2 clusteriser par-dessus
      instances: 1,
    },
    {
      name: "movix-proxiesembed",
      cwd: "/www/wwwroot/movix/API/proxiesembed",
      script: "server.py",
      interpreter: "/www/wwwroot/movix/API/proxiesembed/venv/bin/python3",
    },
    {
      name: "movix-bypass403",
      cwd: "/www/wwwroot/movix/API/miscs",
      script: "bypass403.py",
      interpreter: "/www/wwwroot/movix/API/miscs/venv/bin/python3",
    },
  ],
};
