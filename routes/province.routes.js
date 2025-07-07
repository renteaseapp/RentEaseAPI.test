<<<<<<< HEAD
import express from 'express';
import ProvinceController from '../controllers/province.controller.js';

const router = express.Router();

router.get('/', ProvinceController.getAll);

=======
import express from 'express';
import ProvinceController from '../controllers/province.controller.js';

const router = express.Router();

router.get('/', ProvinceController.getAll);

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default router; 