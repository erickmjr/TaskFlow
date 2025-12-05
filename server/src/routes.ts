import { Router } from 'express';
import { authMiddleware } from './auth-middleware';
export const router = Router();
import * as TasksController from './controllers/tasks-controller';
import * as UserController from './controllers/user-controller';

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);

router.get('/tasks', authMiddleware, TasksController.getTasks);
router.post('/tasks', authMiddleware, TasksController.postTask);
router.put('/tasks', authMiddleware, TasksController.putTask);
router.patch('/tasks/:id', authMiddleware, TasksController.patchTask);
router.delete('/tasks/:id', authMiddleware, TasksController.deleteTask);

export default router;