import supabase from '../db/supabaseClient.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import NotificationService from './notification.service.js';
import FileService from './file.service.js';

const ComplaintService = {
    async createComplaint(complainantId, complaintData, attachmentFiles) {
        // complaintData: { subject_user_id, related_rental_id, related_product_id, complaint_type, title, details, priority }
        const { subject_user_id, related_rental_id, related_product_id, complaint_type, title, details, priority } = complaintData;
        const { data: newComplaint, error } = await supabase
            .from('complaints')
            .insert({
                complainant_id: complainantId,
                subject_user_id,
                related_rental_id,
                related_product_id,
                complaint_type,
                title,
                details,
                priority: priority || 'medium',
                status: 'submitted'
            })
            .select('*')
            .single();
        if (error) throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, error.message);
        // แจ้งเตือนผู้ถูกร้องเรียน
        if (subject_user_id) {
            await NotificationService.createNotification({
                user_id: subject_user_id,
                type: 'complaint_created',
                title: 'คุณถูกแจ้งร้องเรียน',
                message: `คุณถูกแจ้งร้องเรียนในระบบ: ${title}`,
                link_url: `/complaints/${newComplaint.id}`,
                related_entity_type: 'complaint',
                related_entity_id: newComplaint.id,
                related_entity_uid: newComplaint.complaint_uid
            });
        }

        if (attachmentFiles && attachmentFiles.length > 0) {
            const bucketName = 'complaint-attachments';
            for (const file of attachmentFiles) {
                const fileName = `complaint-${newComplaint.id}-${Date.now()}-${file.originalname}`;
                const { publicUrl } = await FileService.uploadFileToSupabaseStorage(file, bucketName, `public/${fileName}`);

                if(publicUrl) {
                    // เราอาจจะต้องมีตาราง complaint_attachments แยก
                    // สมมติว่ามีตาราง complaint_attachments
                    await supabase.from('complaint_attachments').insert({
                        complaint_id: newComplaint.id,
                        uploaded_by_id: complainantId,
                        file_url: publicUrl,
                        file_type: file.mimetype,
                        description: file.originalname,
                    });
                }
            }
        }
        // ดึงข้อมูล complaint กลับมาอีกครั้งพร้อม attachments
        return this.getComplaintDetails(newComplaint.id, complainantId);
    },
    async updateComplaintStatus(complaintId, newStatus, adminId = null, resolutionNotes = null) {
        // อัปเดตสถานะ complaint
        const { data, error } = await supabase
            .from('complaints')
            .update({ status: newStatus, admin_handler_id: adminId, resolution_notes: resolutionNotes })
            .eq('id', complaintId)
            .select('*')
            .single();
        if (error) throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, error.message);
        // แจ้งเตือนผู้ร้องเรียน
        await NotificationService.createNotification({
            user_id: data.complainant_id,
            type: 'complaint_status_updated',
            title: 'สถานะการร้องเรียนของคุณเปลี่ยนแปลง',
            message: `สถานะการร้องเรียนของคุณสำหรับ '${data.title}' เปลี่ยนเป็น ${newStatus}`,
            link_url: `/complaints/${data.id}`,
            related_entity_type: 'complaint',
            related_entity_id: data.id,
            related_entity_uid: data.complaint_uid
        });
        return data;
    },
    async getComplaintsByUserId(userId, filters = {}) {
        const { page = 1, limit = 10, status } = filters;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('complaints')
            .select('*', { count: 'exact' })
            .eq('complainant_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching complaints:", error);
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Could not fetch complaints.');
        }

        return {
            items: data,
            total: count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        };
    },
    async getComplaintDetails(complaintId, userId) {
        const { data: complaint, error } = await supabase
            .from('complaints')
            .select(`
                *,
                complaint_attachments ( * ),
                complainant:complainant_id ( id, first_name, last_name, profile_picture_url ),
                subject_user:subject_user_id ( id, first_name, last_name, profile_picture_url )
            `)
            .eq('id', complaintId)
            .single();
        
        if (error) {
            console.error("Error fetching complaint details:", error);
            throw new ApiError(httpStatusCodes.NOT_FOUND, 'Complaint not found.');
        }
        
        // Check permission
        if (complaint.complainant_id !== userId /* && !isAdmin */) {
            throw new ApiError(httpStatusCodes.FORBIDDEN, 'You are not authorized to view this complaint.');
        }

        // TODO: Add updates/replies logic if there is a complaint_updates table
        complaint.updates = []; 

        return complaint;
    },
    async addComplaintUpdate(complaintId, userId, updateData, attachmentFiles) {
        // First, get the complaint to verify ownership
        const complaint = await this.getComplaintDetails(complaintId, userId);
        
        // For now, let's assume we don't have a separate updates table.
        // We can add a note to admin_notes for simplicity.
        const newNote = `[User Update - ${new Date().toISOString()}] ${updateData.message}`;
        const updatedAdminNotes = complaint.admin_notes ? `${complaint.admin_notes}\n${newNote}` : newNote;

        const { data: updatedComplaint, error } = await supabase
            .from('complaints')
            .update({ admin_notes: updatedAdminNotes })
            .eq('id', complaintId)
            .select()
            .single();
        
        if(error) {
            throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, 'Could not update complaint.');
        }

        // Handle file uploads for the update
        if (attachmentFiles && attachmentFiles.length > 0) {
            // ... (similar logic as in createComplaint)
        }

        return updatedComplaint;
    },
};

export default ComplaintService; 