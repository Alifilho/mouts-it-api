export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'defaultSecretKey',
  expiresIn: '3600s',
};
