import SystemSettingModel from '../models/systemSetting.model.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const SettingsService = {
    /**
     * ดึงการตั้งค่าค่าธรรมเนียมที่จำเป็นสำหรับหน้า checkout
     * @returns {Object} - ข้อมูลค่าธรรมเนียมต่างๆ
     */
    async getPublicFeeSettings() {
        try {
            // ดึงค่าธรรมเนียมที่จำเป็นสำหรับการคำนวณในหน้า checkout
            const [
                platformFeeSetting,
                platformFeeOwnerSetting,
                deliveryFeeSetting
            ] = await Promise.all([
                SystemSettingModel.getSetting('platform_fee_percentage', '0.0'),
                SystemSettingModel.getSetting('platform_fee_owner_percentage', '0.0'),
                SystemSettingModel.getSetting('delivery_fee_base', '0.0')
            ]);

            return {
                platform_fee_percentage: parseFloat(platformFeeSetting.setting_value) || 0.0,
                platform_fee_owner_percentage: parseFloat(platformFeeOwnerSetting.setting_value) || 0.0,
                delivery_fee_base: parseFloat(deliveryFeeSetting.setting_value) || 0.0
            };
        } catch (error) {
            throw new ApiError(
                httpStatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve fee settings"
            );
        }
    },

    /**
     * คำนวณค่าธรรมเนียมโดยประมาณสำหรับหน้า checkout
     * @param {number} subtotalRentalFee - ค่าเช่ารวม
     * @param {string} pickupMethod - วิธีการรับสินค้า
     * @returns {Object} - ค่าธรรมเนียมที่คำนวณแล้ว
     */
    async calculateEstimatedFees(subtotalRentalFee, pickupMethod = 'self_pickup') {
        try {
            const feeSettings = await this.getPublicFeeSettings();
            
            // คำนวณค่าธรรมเนียมแพลตฟอร์ม
            const platformFeeRenter = subtotalRentalFee * (feeSettings.platform_fee_percentage / 100);
            const platformFeeOwner = subtotalRentalFee * (feeSettings.platform_fee_owner_percentage / 100);
            
            // ค่าส่ง (เฉพาะเมื่อเลือก delivery)
            const deliveryFee = pickupMethod === 'delivery' ? feeSettings.delivery_fee_base : 0;
            
            // คำนวณค่าธรรมเนียมรวม (เฉพาะค่าธรรมเนียม ไม่รวมค่าเช่า)
            const totalEstimatedFees = platformFeeRenter + deliveryFee;
            
            // คำนวณยอดรวมทั้งหมด (ค่าเช่า + ค่าธรรมเนียม)
            const totalAmountEstimate = subtotalRentalFee + totalEstimatedFees;
            
            return {
                subtotal_rental_fee: subtotalRentalFee,
                platform_fee_renter: platformFeeRenter,
                platform_fee_owner: platformFeeOwner,
                delivery_fee: deliveryFee,
                total_estimated_fees: totalEstimatedFees,
                total_amount_estimate: totalAmountEstimate
            };
        } catch (error) {
            throw new ApiError(
                httpStatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to calculate estimated fees"
            );
        }
    },

    /**
     * ดึงการตั้งค่าสาธารณะรวมถึง buffer time settings
     * @returns {Object} - ข้อมูลการตั้งค่าต่างๆ
     */
    async getPublicSettings() {
        try {
            const [
                bufferEnabledSetting,
                deliveryBufferSetting,
                returnBufferSetting,
                maxRentalDaysSetting
            ] = await Promise.all([
                SystemSettingModel.getSetting('buffer_enabled', 'true'),
                SystemSettingModel.getSetting('delivery_buffer_days', '1'),
                SystemSettingModel.getSetting('return_buffer_days', '1'),
                SystemSettingModel.getSetting('max_rental_days', '30')
            ]);

            return {
                buffer_settings: {
                    enabled: bufferEnabledSetting.setting_value === 'true',
                    delivery_buffer_days: parseInt(deliveryBufferSetting.setting_value) || 1,
                    return_buffer_days: parseInt(returnBufferSetting.setting_value) || 1
                },
                rental_settings: {
                    max_rental_days: parseInt(maxRentalDaysSetting.setting_value) || 30
                }
            };
        } catch (error) {
            throw new ApiError(
                httpStatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve public settings"
            );
        }
    }
};

export default SettingsService;