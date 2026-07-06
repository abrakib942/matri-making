module.exports = {
  apps: [
    {
      name: '@repo/storage',
      cwd: __dirname,
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
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
