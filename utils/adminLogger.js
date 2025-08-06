import supabase from '../db/supabaseClient.js';

/**
 * Utility for logging admin actions to admin_logs table
 */
class AdminLogger {
  /**
   * Log an admin action
   * @param {Object} params
   * @param {number} params.adminUserId - ID of the admin user performing the action
   * @param {string} params.actionType - Type of action (e.g., USER_UPDATE, PRODUCT_APPROVE, SETTING_CHANGE)
   * @param {string} params.targetEntityType - Type of entity being acted upon (e.g., User, Product, Rental)
   * @param {number} params.targetEntityId - ID of the target entity
   * @param {string} [params.targetEntityUid] - UID of the target entity (if applicable)
   * @param {Object} [params.details] - Additional details about the action
   * @param {string} [params.ipAddress] - IP address of the admin
   * @param {string} [params.userAgent] - User agent of the admin
   */
  static async logAction({
    adminUserId,
    actionType,
    targetEntityType,
    targetEntityId,
    targetEntityUid = null,
    details = null,
    ipAddress = null,
    userAgent = null
  }) {
    try {
      const logData = {
        admin_user_id: adminUserId,
        action_type: actionType,
        target_entity_type: targetEntityType,
        target_entity_id: targetEntityId,
        target_entity_uid: targetEntityUid,
        details: details ? JSON.stringify(details) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      };

      console.log('Inserting admin log:', logData);

      const { error } = await supabase
        .from('admin_logs')
        .insert([logData]);

      if (error) {
        console.error('Error logging admin action:', error);
        // Don't throw error to avoid breaking the main functionality
      } else {
        console.log('Admin log inserted successfully');
      }
    } catch (error) {
      console.error('Error in AdminLogger.logAction:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Convenience methods for common admin actions
  /**
   * Get client IP address from request object
   * @param {Object} req - Express request object
   * @returns {string} IP address
   */
  static getClientIP(req) {
    if (!req) return null;
    
    // Try different methods to get the real IP address
    let ip = req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.connection?.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.headers['x-client-ip'] ||
           req.headers['cf-connecting-ip'] ||
           req.headers['x-forwarded']?.split(',')[0] ||
           req.headers['forwarded-for']?.split(',')[0] ||
           req.headers['forwarded']?.split(',')[0] ||
           null;
    
    // Convert IPv6 loopback to IPv4 loopback for better readability
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1 (localhost)';
    }
    
    // Remove IPv6 prefix if present
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    
    console.log('IP Address Detection:', {
      req_ip: req.ip,
      connection_remoteAddress: req.connection?.remoteAddress,
      socket_remoteAddress: req.socket?.remoteAddress,
      x_forwarded_for: req.headers['x-forwarded-for'],
      x_real_ip: req.headers['x-real-ip'],
      x_client_ip: req.headers['x-client-ip'],
      cf_connecting_ip: req.headers['cf-connecting-ip'],
      final_ip: ip
    });
    
    return ip;
  }

  static async logUserAction(adminUserId, action, userId, details = null, req = null) {
    return this.logAction({
      adminUserId,
      actionType: action,
      targetEntityType: 'User',
      targetEntityId: userId,
      details,
      ipAddress: this.getClientIP(req),
      userAgent: req?.get('User-Agent')
    });
  }

  static async logProductAction(adminUserId, action, productId, details = null, req = null) {
    return this.logAction({
      adminUserId,
      actionType: action,
      targetEntityType: 'Product',
      targetEntityId: productId,
      details,
      ipAddress: this.getClientIP(req),
      userAgent: req?.get('User-Agent')
    });
  }

  static async logCategoryAction(adminUserId, action, categoryId, details = null, req = null) {
    return this.logAction({
      adminUserId,
      actionType: action,
      targetEntityType: 'Category',
      targetEntityId: categoryId,
      details,
      ipAddress: this.getClientIP(req),
      userAgent: req?.get('User-Agent')
    });
  }

  static async logSettingAction(adminUserId, action, settingKey, details = null, req = null) {
    return this.logAction({
      adminUserId,
      actionType: action,
      targetEntityType: 'Setting',
      targetEntityId: 0, // Settings don't have numeric IDs, use 0
      targetEntityUid: settingKey,
      details,
      ipAddress: this.getClientIP(req),
      userAgent: req?.get('User-Agent')
    });
  }

  static async logComplaintAction(adminUserId, action, complaintId, details = null, req = null) {
    return this.logAction({
      adminUserId,
      actionType: action,
      targetEntityType: 'Complaint',
      targetEntityId: complaintId,
      details,
      ipAddress: this.getClientIP(req),
      userAgent: req?.get('User-Agent')
    });
  }

  static async logSystemAction(adminUserId, action, details = null, req = null) {
    return this.logAction({
      adminUserId,
      actionType: action,
      targetEntityType: 'System',
      targetEntityId: 0,
      details,
      ipAddress: this.getClientIP(req),
      userAgent: req?.get('User-Agent')
    });
  }
}

export default AdminLogger; 