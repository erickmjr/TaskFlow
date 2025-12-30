import { Router } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
export const router = Router();
import * as TasksController from './controllers/tasks-controller';
import * as UserController from './controllers/user-controller';
import { resetPasswordMiddleware } from './middlewares/reset-password-middleware';

router.post('/user/register', UserController.registerUser);
router.post('/user/login', UserController.loginUser);
router.post('/user/forgot-password', UserController.forgotPassword);
router.post('user/reset-password', resetPasswordMiddleware, UserController.resetPassword);

router.get('/tasks', authMiddleware, TasksController.getTasks);
router.get('/tasks/:id', authMiddleware, TasksController.getTaskById);
router.post('/tasks', authMiddleware, TasksController.postTask);
router.put('/tasks/:id', authMiddleware, TasksController.putTask);
router.patch('/tasks/:id', authMiddleware, TasksController.patchTask);
router.delete('/tasks/:id', authMiddleware, TasksController.deleteTask);

export default router;