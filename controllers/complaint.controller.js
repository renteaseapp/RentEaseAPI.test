import { asyncHandler } from '../utils/asyncHandler.js';
import ComplaintService from '../services/complaint.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';

const ComplaintController = {
  createComplaint: asyncHandler(async (req, res) => {
    const complainantId = req.user.id;
    const complaintData = req.validatedData;
    const attachmentFiles = req.files?.attachments || [];

    const newComplaint = await ComplaintService.createComplaint(complainantId, complaintData, attachmentFiles);

    res.status(httpStatusCodes.CREATED).json(
      new ApiResponse(httpStatusCodes.CREATED, { data: newComplaint }, "Complaint created successfully")
    );
  }),

  getMyComplaints: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const filters = req.validatedData;
    const complaints = await ComplaintService.getComplaintsByUserId(userId, filters);
    res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, { data: complaints }));
  }),

  getComplaintById: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { complaintId } = req.validatedData;
    const complaint = await ComplaintService.getComplaintDetails(complaintId, userId);
    res.status(httpStatusCodes.OK).json(new ApiResponse(httpStatusCodes.OK, { data: complaint }));
  }),

  addUpdateToComplaint: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { complaintId } = req.params;
    const updateData = req.validatedData;
    const attachmentFiles = req.files?.attachments || [];

    const updatedComplaint = await ComplaintService.addComplaintUpdate(complaintId, userId, updateData, attachmentFiles);

     res.status(httpStatusCodes.OK).json(
      new ApiResponse(httpStatusCodes.OK, { data: updatedComplaint }, "Complaint updated successfully")
    );
  }),
};

export default ComplaintController; 