<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config();

const storageConfig = {
    avatarBucketName: process.env.AVATAR_BUCKET_NAME || 'avatars',
    idVerificationBucketName: process.env.ID_VERIFICATION_BUCKET_NAME || 'id-verification',
    chatFilesBucketName: process.env.CHAT_FILES_BUCKET_NAME || 'chat-files'
};

=======
import dotenv from 'dotenv';
dotenv.config();

const storageConfig = {
    avatarBucketName: process.env.AVATAR_BUCKET_NAME || 'avatars',
    idVerificationBucketName: process.env.ID_VERIFICATION_BUCKET_NAME || 'id-verification',
    chatFilesBucketName: process.env.CHAT_FILES_BUCKET_NAME || 'chat-files'
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default storageConfig; 