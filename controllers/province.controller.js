<<<<<<< HEAD
import ProvinceService from '../services/province.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const ProvinceController = {
    getAll: asyncHandler(async (req, res) => {
        const provinces = await ProvinceService.getAllProvinces();
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: provinces })
        );
    })
};

=======
import ProvinceService from '../services/province.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const ProvinceController = {
    getAll: asyncHandler(async (req, res) => {
        const provinces = await ProvinceService.getAllProvinces();
        res.status(httpStatusCodes.OK).json(
            new ApiResponse(httpStatusCodes.OK, { data: provinces })
        );
    })
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default ProvinceController; 