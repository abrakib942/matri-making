module.exports = {
  apps: [
    {
      name: '@repo/web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5004',
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
