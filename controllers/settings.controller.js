import SettingsService from '../services/settings.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SettingsController = {
    /**
     * ดึงการตั้งค่าค่าธรรมเนียมที่จำเป็นสำหรับหน้า checkout
     */
    getPublicFeeSettings: asyncHandler(async (req, res) => {
        const feeSettings = await SettingsService.getPublicFeeSettings();
        res.json({
            success: true,
            data: feeSettings
        });
    }),

    /**
     * คำนวณค่าธรรมเนียมโดยประมาณสำหรับหน้า checkout
     */
    calculateEstimatedFees: asyncHandler(async (req, res) => {
        const { subtotal_rental_fee, pickup_method } = req.body;
        
        if (!subtotal_rental_fee || subtotal_rental_fee <= 0) {
            return res.status(400).json({
                success: false,
                message: "Subtotal rental fee is required and must be greater than 0"
            });
        }

        const estimatedFees = await SettingsService.calculateEstimatedFees(
            parseFloat(subtotal_rental_fee),
            pickup_method || 'self_pickup'
        );

        res.json({
            success: true,
            data: estimatedFees
        });
    }),

    /**
     * ดึงการตั้งค่าสาธารณะรวมถึง buffer time settings
     */
    getPublicSettings: asyncHandler(async (req, res) => {
        const settings = await SettingsService.getPublicSettings();
        res.json({
            success: true,
            data: settings
        });
    })
};

export default SettingsController;