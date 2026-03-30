import { Router } from 'express';
import { validate } from "../middlewares/user.middleware";
import { loginSchema } from '../validation/auth.validation';
import { protect } from '../middlewares/auth.middleware';
import { login, refreshToken } from '../controllers/auth.controller';

const router = Router();

router.post('/login',
    validate(loginSchema), 
    login
);
router.get('/refresh', 
    protect, 
    refreshToken
);

export default router;