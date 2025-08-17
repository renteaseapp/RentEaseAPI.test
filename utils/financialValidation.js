/**
 * Financial Validation Utilities
 * ใช้สำหรับตรวจสอบความถูกต้องของการคำนวณทางการเงินในระบบ
 */

import { ApiError } from './apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

/**
 * ตรวจสอบความถูกต้องของจำนวนเงิน
 * @param {number} amount - จำนวนเงิน
 * @param {string} fieldName - ชื่อฟิลด์ (สำหรับ error message)
 * @returns {boolean} - true ถ้าถูกต้อง
 */
export const validateAmount = (amount, fieldName = 'amount') => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, `Invalid ${fieldName}: must be a valid number`);
    }
    if (amount < 0) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, `Invalid ${fieldName}: cannot be negative`);
    }
    return true;
};

/**
 * ตรวจสอบความถูกต้องของเปอร์เซ็นต์
 * @param {number} percentage - เปอร์เซ็นต์
 * @param {string} fieldName - ชื่อฟิลด์ (สำหรับ error message)
 * @param {number} maxPercentage - เปอร์เซ็นต์สูงสุดที่อนุญาต (default: 100)
 * @returns {boolean} - true ถ้าถูกต้อง
 */
export const validatePercentage = (percentage, fieldName = 'percentage', maxPercentage = 100) => {
    validateAmount(percentage, fieldName);
    if (percentage > maxPercentage) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, `Invalid ${fieldName}: cannot exceed ${maxPercentage}%`);
    }
    return true;
};

/**
 * ตรวจสอบความถูกต้องของการคำนวณค่าเช่า
 * @param {Object} rentalData - ข้อมูลการเช่า
 * @returns {Object} - ข้อมูลที่ตรวจสอบแล้ว
 */
export const validateRentalCalculation = (rentalData) => {
    const {
        rental_price_per_day,
        rental_duration_days,
        security_deposit,
        delivery_fee,
        platform_fee_renter,
        platform_fee_owner
    } = rentalData;

    // ตรวจสอบข้อมูลพื้นฐาน
    validateAmount(rental_price_per_day, 'rental_price_per_day');
    validateAmount(rental_duration_days, 'rental_duration_days');
    validateAmount(security_deposit, 'security_deposit');
    validateAmount(delivery_fee, 'delivery_fee');
    validateAmount(platform_fee_renter, 'platform_fee_renter');
    validateAmount(platform_fee_owner, 'platform_fee_owner');

    // คำนวณและตรวจสอบ subtotal
    const subtotal = rental_price_per_day * rental_duration_days;
    validateAmount(subtotal, 'calculated_subtotal_rental_fee');

    // คำนวณและตรวจสอบ total amount due
    const totalAmountDue = subtotal + security_deposit + delivery_fee + platform_fee_renter;
    validateAmount(totalAmountDue, 'total_amount_due');

    return {
        subtotal,
        totalAmountDue,
        isValid: true
    };
};

/**
 * ตรวจสอบความถูกต้องของการคำนวณค่าปรับล่าช้า
 * @param {number} lateFee - ค่าปรับล่าช้า
 * @param {number} securityDeposit - เงินประกัน
 * @returns {Object} - ข้อมูลที่ตรวจสอบแล้ว
 */
export const validateLateFeeCalculation = (lateFee, securityDeposit) => {
    validateAmount(lateFee, 'late_fee_calculated');
    validateAmount(securityDeposit, 'security_deposit');

    // ตรวจสอบว่าค่าปรับล่าช้าไม่เกินเงินประกัน
    if (lateFee > securityDeposit) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Late fee cannot exceed security deposit amount');
    }

    // คำนวณเงินประกันที่จะคืน
    const securityDepositRefund = Math.max(0, securityDeposit - lateFee);
    validateAmount(securityDepositRefund, 'security_deposit_refund_amount');

    return {
        securityDepositRefund,
        isValid: true
    };
};

/**
 * ตรวจสอบความถูกต้องของการชำระเงิน
 * @param {number} amountPaid - จำนวนเงินที่ชำระ
 * @param {number} totalAmountDue - จำนวนเงินที่ต้องชำระ
 * @returns {boolean} - true ถ้าถูกต้อง
 */
export const validatePaymentAmount = (amountPaid, totalAmountDue) => {
    validateAmount(amountPaid, 'amount_paid');
    validateAmount(totalAmountDue, 'total_amount_due');

    if (amountPaid < totalAmountDue) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Payment amount is less than the total amount due');
    }

    return true;
};

/**
 * ตรวจสอบความถูกต้องของการคำนวณรายได้
 * @param {number} finalAmountPaid - จำนวนเงินที่ชำระจริง
 * @param {number} platformFeeOwner - ค่าธรรมเนียมแพลตฟอร์มฝั่งเจ้าของ
 * @returns {Object} - ข้อมูลที่ตรวจสอบแล้ว
 */
export const validateRevenueCalculation = (finalAmountPaid, platformFeeOwner) => {
    validateAmount(finalAmountPaid, 'final_amount_paid');
    validateAmount(platformFeeOwner, 'platform_fee_owner');

    // คำนวณรายได้ที่แท้จริง
    const revenue = finalAmountPaid - platformFeeOwner;
    validateAmount(revenue, 'calculated_revenue');

    return {
        revenue,
        isValid: true
    };
};

/**
 * ตรวจสอบความถูกต้องของระบบการตั้งค่าค่าธรรมเนียม
 * @param {Object} settings - การตั้งค่าต่างๆ
 * @returns {boolean} - true ถ้าถูกต้อง
 */
export const validateFeeSettings = (settings) => {
    const {
        platform_fee_percentage,
        platform_fee_owner_percentage,
        late_fee_per_day,
        delivery_fee_base
    } = settings;

    // ตรวจสอบเปอร์เซ็นต์ค่าธรรมเนียมแพลตฟอร์ม
    if (platform_fee_percentage !== undefined) {
        validatePercentage(platform_fee_percentage, 'platform_fee_percentage', 50);
    }
    if (platform_fee_owner_percentage !== undefined) {
        validatePercentage(platform_fee_owner_percentage, 'platform_fee_owner_percentage', 50);
    }

    // ตรวจสอบค่าปรับล่าช้าต่อวัน
    if (late_fee_per_day !== undefined) {
        validateAmount(late_fee_per_day, 'late_fee_per_day');
    }

    // ตรวจสอบค่าส่งพื้นฐาน
    if (delivery_fee_base !== undefined) {
        validateAmount(delivery_fee_base, 'delivery_fee_base');
    }

    return true;
};

export default {
    validateAmount,
    validatePercentage,
    validateRentalCalculation,
    validateLateFeeCalculation,
    validatePaymentAmount,
    validateRevenueCalculation,
    validateFeeSettings
}; 