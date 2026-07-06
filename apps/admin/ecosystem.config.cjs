module.exports = {
  apps: [
    {
      name: '@repo/admin',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5003',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
