import { OAuth2Client } from 'google-auth-library';
import UserModel from '../models/user.model.js';
import { generateToken } from '../utils/jwt.utils.js';
import { ApiError } from '../utils/apiError.js';
import httpStatusCodes from '../constants/httpStatusCodes.js';
import googleConfig from '../config/google.config.js';
import { hashPassword } from '../utils/password.utils.js';

// Validate Google config
if (!googleConfig.clientId || !googleConfig.clientSecret) {
    console.error('❌ Google OAuth configuration missing. Please check your environment variables:');
    console.error('   GOOGLE_CLIENT_ID:', googleConfig.clientId ? 'Set' : 'Missing');
    console.error('   GOOGLE_CLIENT_SECRET:', googleConfig.clientSecret ? 'Set' : 'Missing');
}

const googleAuthService = {
    // สร้าง Google OAuth URL สำหรับ login
    getAuthUrl() {
        const oauth2Client = new OAuth2Client(
            googleConfig.clientId,
            googleConfig.clientSecret,
            googleConfig.redirectUri
        );

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: googleConfig.scopes,
            prompt: 'consent'
        });

        return authUrl;
    },

    // แลกเปลี่ยน authorization code เป็น access token และดึงข้อมูลผู้ใช้
    async handleCallback(code) {
        try {
            const oauth2Client = new OAuth2Client(
                googleConfig.clientId,
                googleConfig.clientSecret,
                googleConfig.redirectUri
            );

            // แลกเปลี่ยน code เป็น tokens
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            // ดึงข้อมูลผู้ใช้จาก Google
            const userInfo = await this.getGoogleUserInfo(oauth2Client);

            // ตรวจสอบหรือสร้างผู้ใช้ในระบบ
            const user = await this.findOrCreateUser(userInfo);

            // สร้าง JWT token
            const isAdmin = await UserModel.checkAdmin(user.id);
            const tokenPayload = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                is_admin: isAdmin,
                role: isAdmin ? 'admin' : 'user',
            };
            const accessToken = generateToken(tokenPayload);

            // อัปเดต last login
            await UserModel.updateLastLogin(user.id);

            const { password_hash, ...userResponseData } = user;

            return {
                accessToken,
                user: userResponseData,
                is_admin: isAdmin
            };
        } catch (error) {
            console.error('Google OAuth error:', error);
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Google authentication failed');
        }
    },

    // ดึงข้อมูลผู้ใช้จาก Google API
    async getGoogleUserInfo(oauth2Client) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${oauth2Client.credentials.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info from Google');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching Google user info:', error);
            throw new Error('Failed to get user information from Google');
        }
    },

    // ค้นหาหรือสร้างผู้ใช้ในระบบ
    async findOrCreateUser(googleUserInfo) {
        console.log('🔍 findOrCreateUser called with:', googleUserInfo);
        
        if (!googleUserInfo || !googleUserInfo.email) {
            throw new Error('Invalid Google user info: missing email');
        }
        
        // Google user info อาจมี 'id' หรือ 'sub' field
        const { email, given_name, family_name, picture, sub, id } = googleUserInfo;
        const googleId = sub || id; // ใช้ sub ถ้ามี ถ้าไม่มีใช้ id
        
        console.log('🔍 Extracted Google ID:', { sub, id, googleId });

        // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
        console.log('🔍 Looking for user with email:', email);
        let user = await UserModel.findByEmail(email);
        console.log('🔍 User found:', user);

        if (user) {
            console.log('🔍 Existing user found, checking google_id...');
            console.log('🔍 Current google_id:', user.google_id);
            console.log('🔍 New google_id from Google:', googleId);
            
            // อัปเดตข้อมูล Google ID และ profile picture เฉพาะครั้งแรกที่เชื่อมต่อ
            const updates = {};
            if (!user.google_id) {
                updates.google_id = googleId;
            }
            // ถ้ายังไม่มี profile_picture_url ให้ใช้รูปจาก Google
            if (!user.profile_picture_url) {
                updates.profile_picture_url = picture;
            }

            if (Object.keys(updates).length > 0) {
                console.log('🔍 Updating user with initial Google data:', updates);
                try {
                    await UserModel.update(user.id, updates);
                    // ดึงข้อมูลผู้ใช้ที่อัปเดตแล้วกลับมา
                    user = await UserModel.findByEmail(email);
                    console.log('🔍 Updated user data:', user);
                } catch (error) {
                    console.error('❌ Error updating user with initial Google data:', error);
                    throw error;
                }
            } else {
                console.log('🔍 User data is already linked with Google');
            }
            return user;
        }

        // สร้างผู้ใช้ใหม่
        console.log('🔍 Creating new user');
        const userData = {
            email,
            username: email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5), // Generate unique username
            first_name: given_name || '',
            last_name: family_name || '',
            profile_picture_url: picture,
            google_id: googleId,
            email_verified_at: new Date().toISOString(), // Google email ผ่านการยืนยันแล้ว
            is_active: true
        };

        // สร้าง password hash แบบสุ่ม (ผู้ใช้จะไม่ใช้ password นี้)
        const randomPassword = Math.random().toString(36).slice(-10);
        userData.password_hash = await hashPassword(randomPassword);

        console.log('🔍 User data to create:', userData);
        try {
            const newUser = await UserModel.create(userData);
                       console.log('🔍 New user created:', newUser);
           console.log('🔍 New user verification status:', newUser.id_verification_status);
           return newUser;
        } catch (error) {
            console.error('❌ Error creating user:', error);
            throw error;
        }
    },

    // ตรวจสอบ Google ID token (สำหรับ mobile apps)
    async verifyIdToken(idToken) {
        try {
            const client = new OAuth2Client(googleConfig.clientId);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: googleConfig.clientId
            });

            const payload = ticket.getPayload();
            return payload;
        } catch (error) {
            console.error('Google ID token verification error:', error);
            throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid Google ID token');
        }
    }
};

export default googleAuthService;
