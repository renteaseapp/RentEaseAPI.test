<<<<<<< HEAD
import express from 'express';
import CategoryController from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', CategoryController.getAll);

=======
import express from 'express';
import CategoryController from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', CategoryController.getAll);

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default router; 