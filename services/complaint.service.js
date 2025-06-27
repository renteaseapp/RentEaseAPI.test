import supabase from '../db/supabaseClient.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import NotificationService from './notification.service.js';

const ComplaintService = {
    async createComplaint(complainantId, complaintData) {
        // complaintData: { subject_user_id, related_rental_id, related_product_id, complaint_type, title, details, priority }
        const { subject_user_id, related_rental_id, related_product_id, complaint_type, title, details, priority } = complaintData;
        const { data, error } = await supabase
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
                link_url: `/complaints/${data.id}`,
                related_entity_type: 'complaint',
                related_entity_id: data.id,
                related_entity_uid: data.complaint_uid
            });
        }
        return data;
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
    }
};

export default ComplaintService; 