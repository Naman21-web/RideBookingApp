import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretJwt';

export const generateToken = (payload: object) => {
    return jwt.sign(payload,JWT_SECRET,{
        expiresIn: '1d',
    });
};

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token:string, secret:string) => {
    return jwt.verify(token, secret);
}