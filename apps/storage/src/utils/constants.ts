export const constants = {
  // environment
  DEV: 'development',
  TEST: 'test',
  STAG: 'staging',
  PROD: 'production',
} as const;

export type Environment = (typeof constants)[keyof typeof constants];

export default constants;
