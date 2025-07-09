import express from 'express';
import ComplaintController from '../controllers/complaint.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadMultipleFields } from '../middleware/fileUpload.js';
import { createComplaintSchema, updateComplaintSchema } from '../DTOs/complaint.dto.js';
import { paginationSchema } from '../DTOs/common.dto.js';
import Joi from 'joi';

const router = express.Router();

router.use(authenticateJWT);

// สร้างเรื่องร้องเรียนใหม่
router.post(
  '/',
  uploadMultipleFields([{ name: 'attachments', maxCount: 5 }]),
  validateRequest(createComplaintSchema, 'body'),
  ComplaintController.createComplaint
);

// ดูรายการร้องเรียนทั้งหมดของผู้ใช้
router.get(
    '/my',
    validateRequest(paginationSchema.keys({
        status: Joi.string().optional()
    }), 'query'),
    ComplaintController.getMyComplaints
);

// ดูรายละเอียดเรื่องร้องเรียน
router.get(
    '/:complaintId',
    validateRequest(Joi.object({ complaintId: Joi.number().integer().positive().required() }), 'params'),
    ComplaintController.getComplaintById
);

// อัปเดตเรื่องร้องเรียน (เพิ่มข้อความ/ไฟล์แนบ)
router.post(
  '/:complaintId/updates',
  validateRequest(Joi.object({ complaintId: Joi.number().integer().positive().required() }), 'params'),
  uploadMultipleFields([{ name: 'attachments', maxCount: 5 }]),
  validateRequest(updateComplaintSchema, 'body'),
  ComplaintController.addUpdateToComplaint
);


export default router; 