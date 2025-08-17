import supabase from '../db/supabaseClient.js';

const USER_COLUMNS_TO_SELECT = `
    id, username, email, first_name, last_name, phone_number,
    profile_picture_url, email_verified_at, last_login_at, is_active,
    address_line1, address_line2, city, province_id, postal_code,
    id_verification_status, id_verification_notes, id_document_type,
    id_document_number, id_document_url, id_document_back_url, id_selfie_url,
    google_id, created_at, updated_at
`;

const UserModel = {
    async findByEmailOrUsername(emailOrUsername) {
        const term = emailOrUsername.toLowerCase();
        const { data, error } = await supabase
            .from('users')
            .select(`*, password_hash`)
            .or(`email.eq.${term},username.eq.${term}`)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error("Error finding user by email/username:", error);
            throw error;
        }
        return data;
    },

    async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select(USER_COLUMNS_TO_SELECT)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*') // Select all columns to get full user object
            .eq('email', email.toLowerCase())
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async findByGoogleId(googleId) {
        const { data, error } = await supabase
            .from('users')
            .select(USER_COLUMNS_TO_SELECT)
            .eq('google_id', googleId)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async findByUsername(username) {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('username', username.toLowerCase())
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async create(userData) {
        const { username, email, password_hash, first_name, last_name, phone_number, registration_ip, google_id, profile_picture_url, email_verified_at } = userData;
        const { data, error } = await supabase
            .from('users')
            .insert({
                username,
                email: email.toLowerCase(),
                password_hash,
                first_name,
                last_name,
                phone_number,
                registration_ip,
                google_id,
                profile_picture_url,
                email_verified_at,
                is_active: true,
                id_verification_status: 'not_submitted',
            })
            .select(USER_COLUMNS_TO_SELECT)
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, updateData) {
        const allowedFields = [
            'first_name', 'last_name', 'phone_number', 'profile_picture_url', 
            'password_hash', 'address_line1', 'address_line2', 'city', 
            'province_id', 'postal_code', 'id_verification_status', 
            'id_verification_notes', 'id_document_type', 'id_document_number',
            'id_document_url', 'id_document_back_url', 'id_selfie_url',
            'id_verified_at', 'updated_at', 'google_id',
            'is_active', 'role'
        ];

        const dataToUpdate = {};
        for (const key of allowedFields) {
            if (updateData.hasOwnProperty(key)) {
                dataToUpdate[key] = updateData[key];
            }
        }

        if (Object.keys(dataToUpdate).length === 0) {
            console.log('No updatable fields provided for user', id);
            return null;
        }

        const { data, error } = await supabase
            .from('users')
            .update(dataToUpdate)
            .eq('id', id)
            .select(USER_COLUMNS_TO_SELECT)
            .single();

        if (error) throw error;
        return data;
    },

    // เพิ่ม method สำหรับอัปเดต Google ID
    async updateGoogleId(userId, googleId) {
        console.log('🔍 updateGoogleId called with:', { userId, googleId });
        
        // ตรวจสอบว่ามี user นี้อยู่จริงหรือไม่
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', userId)
            .maybeSingle();
            
        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error checking user existence:', checkError);
            throw checkError;
        }
        
        if (!existingUser) {
            console.error('❌ User not found with ID:', userId);
            throw new Error(`User with ID ${userId} not found`);
        }
        
        console.log('🔍 User exists:', existingUser);
        
        const { data, error } = await supabase
            .from('users')
            .update({ google_id: googleId })
            .eq('id', userId)
            .select('id, google_id')
            .single();

        if (error) {
            console.error('❌ Error updating google_id:', error);
            throw error;
        }
        
        console.log('✅ Google ID updated successfully:', data);
        return data;
    },

    async updateLastLogin(id) {
        const { error } = await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', id);
        if (error) console.error("Error updating last login:", error);
    },

    async checkAdmin(userId) {
        const { data, error } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    },

    async updateIdVerification(userId, verificationData) {
        // Fields: id_document_type, id_document_number, id_document_url,
        // id_document_back_url, id_selfie_url, id_verification_status, id_verification_notes
        const { data, error } = await supabase
            .from('users')
            .update(verificationData)
            .eq('id', userId)
            .select(`id, id_verification_status, id_verification_notes, id_document_type, id_document_number, id_document_url, id_document_back_url, id_selfie_url`)
            .single();

        if (error) {
            console.error("Error updating ID verification data:", error);
            throw error;
        }
        return data;
    },



    async updatePassword(userId, hashedPassword) {
        const { error } = await supabase
            .from('users')
            .update({ password_hash: hashedPassword })
            .eq('id', userId);

        if (error) throw error;
    }
};

export default UserModel;
