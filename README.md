# 🏠 RentEase Backend API

> **ระบบ Backend สำหรับแพลตฟอร์มเช่าสินค้าออนไลน์**  
> *Built with Node.js, Express, Supabase, and modern JavaScript*

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-blue.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-orange.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-NISIO-red.svg)](LICENSE)

---

## 📋 สารบัญ

- [🎯 ภาพรวมระบบ](#-ภาพรวมระบบ)
- [🚀 การติดตั้งและ Setup](#-การติดตั้งและ-setup)
- [🏗️ โครงสร้างโปรเจค](#️-โครงสร้างโปรเจค)
- [🔧 การใช้งาน](#-การใช้งาน)
- [📚 API Documentation](#-api-documentation)
- [🔐 การรักษาความปลอดภัย](#-การรักษาความปลอดภัย)
- [📊 ฐานข้อมูล](#-ฐานข้อมูล)
- [🗄️ Storage Buckets](#️-storage-buckets)
- [🛠️ การพัฒนา](#️-การพัฒนา)
- [📝 การ Deploy](#-การ-deploy)
- [🤝 การมีส่วนร่วม](#-การมีส่วนร่วม)

---

## 🎯 ภาพรวมระบบ

**RentEase** เป็นแพลตฟอร์มเช่าสินค้าออนไลน์ที่เชื่อมต่อระหว่างเจ้าของสินค้าและผู้เช่า โดยมีระบบจัดการที่ครบครัน

### ✨ คุณสมบัติหลัก

- 🔐 **ระบบ Authentication & Authorization** - JWT-based authentication
- 👥 **จัดการผู้ใช้** - Registration, Profile, Verification
- 🏷️ **จัดการสินค้า** - Categories, Products, Images
- 📅 **ระบบเช่า** - Booking, Payment, Delivery
- 💬 **ระบบแชท** - Real-time messaging
- ⭐ **ระบบรีวิว** - Rating & Reviews
- 🛡️ **ระบบร้องเรียน** - Complaints & Support
- 📊 **Admin Dashboard** - Comprehensive admin tools
- 📝 **Admin Logs** - Activity tracking
- 🔧 **System Settings** - Configurable settings

### 🏗️ เทคโนโลยีที่ใช้

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.21+
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** JWT
- **Real-time:** Socket.IO
- **Email:** Nodemailer
- **Validation:** Joi
- **Security:** Helmet, CORS

---

## 🚀 การติดตั้งและ Setup

### 📋 ความต้องการของระบบ

- Node.js 18.0.0 หรือใหม่กว่า
- npm หรือ yarn
- Supabase account
- Git

### 🔧 ขั้นตอนการติดตั้ง

#### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd fixApp/backend
```

#### 2. ติดตั้ง Dependencies

```bash
npm install
```

#### 3. สร้าง Supabase Project

1. ไปที่ [Supabase Dashboard](https://app.supabase.com/)
2. สร้างโปรเจคใหม่
3. เก็บ **Project URL** และ **Service Role Key**

#### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` และเพิ่มข้อมูลต่อไปนี้:

**ตัวอย่างไฟล์ `.env`:**

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-or-anon-key

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Supabase Storage
AVATAR_BUCKET_NAME=avatars

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password-or-app-password
SMTP_FROM=your-email@example.com
```

#### 5. Setup ฐานข้อมูลและ Storage

```bash
# รัน setup script ครบถ้วน
npm run setup

# หรือรันทีละขั้นตอน
npm run setup:buckets    # สร้าง storage buckets
npm run setup:schema     # สร้าง database schema
npm run setup:data       # เพิ่มข้อมูลเริ่มต้น
```

#### 6. เริ่มต้น Server

```bash
# Development mode
npm run dev

# Production mode
npm start

# Test server
npm run test-server
```

---

## 🏗️ โครงสร้างโปรเจค

```
backend/
├── 📁 config/                 # การตั้งค่าระบบ
│   ├── database.js           # Database configuration
│   ├── supabase.js           # Supabase client
│   └── socket.js             # Socket.IO setup
├── 📁 controllers/            # API Controllers
│   ├── admin.controller.js   # Admin operations
│   ├── auth.controller.js    # Authentication
│   ├── category.controller.js # Categories
│   ├── chat.controller.js    # Chat system
│   ├── complaint.controller.js # Complaints
│   ├── product.controller.js # Products
│   ├── rental.controller.js  # Rentals
│   ├── review.controller.js  # Reviews
│   ├── setting.controller.js # System settings
│   └── user.controller.js    # User management
├── 📁 middleware/             # Custom Middleware
│   ├── auth.js               # Authentication middleware
│   ├── errorHandler.js       # Error handling
│   ├── rateLimiter.js        # Rate limiting
│   ├── upload.js             # File upload
│   └── validation.js         # Request validation
├── 📁 models/                 # Data Models
│   ├── admin.model.js        # Admin operations
│   ├── category.model.js     # Category operations
│   ├── chat.model.js         # Chat operations
│   ├── complaint.model.js    # Complaint operations
│   ├── product.model.js      # Product operations
│   ├── rental.model.js       # Rental operations
│   ├── review.model.js       # Review operations
│   ├── setting.model.js      # Setting operations
│   └── user.model.js         # User operations
├── 📁 routes/                 # API Routes
│   ├── admin.routes.js       # Admin endpoints
│   ├── auth.routes.js        # Auth endpoints
│   ├── category.routes.js    # Category endpoints
│   ├── chat.routes.js        # Chat endpoints
│   ├── complaint.routes.js   # Complaint endpoints
│   ├── product.routes.js     # Product endpoints
│   ├── rental.routes.js      # Rental endpoints
│   ├── review.routes.js      # Review endpoints
│   ├── setting.routes.js     # Setting endpoints
│   └── user.routes.js        # User endpoints
├── 📁 services/               # Business Logic
│   ├── admin.service.js      # Admin services
│   ├── auth.service.js       # Authentication services
│   ├── category.service.js   # Category services
│   ├── chat.service.js       # Chat services
│   ├── complaint.service.js  # Complaint services
│   ├── email.service.js      # Email services
│   ├── product.service.js    # Product services
│   ├── rental.service.js     # Rental services
│   ├── review.service.js     # Review services
│   ├── setting.service.js    # Setting services
│   └── user.service.js       # User services
├── 📁 setup/                  # Setup Scripts
│   ├── db.sql                # Database schema
│   ├── insert_data.sql       # Initial data
│   ├── setup.js              # Main setup script
│   ├── create_buckets.js     # Storage buckets
│   ├── package.json          # Setup dependencies
│   └── README.md             # Setup documentation
├── 📁 utils/                  # Utility Functions
│   ├── adminLogger.js        # Admin logging
│   ├── apiError.js           # Error handling
│   ├── apiResponse.js        # Response formatting
│   ├── constants.js          # System constants
│   ├── helpers.js            # Helper functions
│   ├── httpStatusCodes.js    # HTTP status codes
│   ├── validators.js         # Validation schemas
│   └── socketEvents.js       # Socket events
├── 📁 uploads/                # File uploads (local)
├── 📁 logs/                   # Application logs
├── 📄 .env.example           # Environment template
├── 📄 .gitignore             # Git ignore rules
├── 📄 package.json           # Dependencies & scripts
├── 📄 server.js              # Main server file
├── 📄 setup.js               # Main setup script
├── 📄 create_buckets.js      # Bucket creation script
└── 📄 README.md              # This file
```

---

## 🔧 การใช้งาน

### 🚀 Scripts ที่มีให้

```bash
# Development
npm run dev              # Start development server with nodemon
npm start               # Start production server


# Database & Storage
npm run setup           # Complete setup (recommended)
npm run setup:buckets   # Create storage buckets only
npm run setup:schema    # Create database schema only
npm run setup:data      # Insert initial data only

```

### 🔍 การตรวจสอบระบบ

#### 1. ตรวจสอบ Server Status

```bash
curl http://localhost:3001/api/health
```

#### 2. ตรวจสอบ Database Connection

```bash
curl http://localhost:3001/api/provinces
```

#### 3. ตรวจสอบ Storage Buckets

```bash
# ตรวจสอบใน Supabase Dashboard
# Storage > Buckets
```

---

## 📚 API Documentation

### 🔗 Base URL

```
Development: http://localhost:3001/api
Production:  https://your-domain.com/api
```

### 🔐 Authentication

ระบบใช้ **JWT (JSON Web Tokens)** สำหรับ authentication

```bash
# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Response
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### 📋 API Endpoints

#### 🔐 Authentication
- `POST /auth/register` - สมัครสมาชิก
- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/logout` - ออกจากระบบ
- `POST /auth/refresh` - รีเฟรช token
- `POST /auth/forgot-password` - ลืมรหัสผ่าน
- `POST /auth/reset-password` - รีเซ็ตรหัสผ่าน

#### 👥 Users
- `GET /users/profile` - ดูโปรไฟล์
- `PUT /users/profile` - แก้ไขโปรไฟล์
- `GET /users/:id/public-profile` - ดูโปรไฟล์สาธารณะ
- `GET /users/addresses` - ที่อยู่ทั้งหมด
- `POST /users/addresses` - เพิ่มที่อยู่
- `PUT /users/addresses/:id` - แก้ไขที่อยู่
- `DELETE /users/addresses/:id` - ลบที่อยู่

#### 🏷️ Categories
- `GET /categories` - หมวดหมู่ทั้งหมด
- `GET /categories/:id` - หมวดหมู่เฉพาะ
- `POST /categories` - สร้างหมวดหมู่ (Admin)
- `PUT /categories/:id` - แก้ไขหมวดหมู่ (Admin)
- `DELETE /categories/:id` - ลบหมวดหมู่ (Admin)

#### 🏠 Products
- `GET /products` - สินค้าทั้งหมด
- `GET /products/:id` - สินค้าเฉพาะ
- `POST /products` - สร้างสินค้า
- `PUT /products/:id` - แก้ไขสินค้า
- `DELETE /products/:id` - ลบสินค้า
- `POST /products/:id/images` - อัปโหลดรูปภาพ
- `DELETE /products/:id/images/:imageId` - ลบรูปภาพ

#### 📅 Rentals
- `GET /rentals` - การเช่าทั้งหมด
- `GET /rentals/:id` - การเช่าเฉพาะ
- `POST /rentals` - สร้างการเช่า
- `PUT /rentals/:id/status` - อัปเดตสถานะ
- `POST /rentals/:id/payment-proof` - อัปโหลดหลักฐานการชำระเงิน

#### 💬 Chat
- `GET /chat/conversations` - บทสนทนาทั้งหมด
- `GET /chat/conversations/:id/messages` - ข้อความในบทสนทนา
- `POST /chat/conversations/:id/messages` - ส่งข้อความ
- `PUT /chat/messages/:id/read` - อ่านข้อความ

#### ⭐ Reviews
- `GET /products/:id/reviews` - รีวิวสินค้า
- `POST /rentals/:id/review` - เขียนรีวิว
- `PUT /reviews/:id` - แก้ไขรีวิว
- `DELETE /reviews/:id` - ลบรีวิว

#### 🛡️ Complaints
- `GET /complaints` - ร้องเรียนทั้งหมด
- `GET /complaints/:id` - ร้องเรียนเฉพาะ
- `POST /complaints` - สร้างร้องเรียน
- `PUT /complaints/:id/reply` - ตอบกลับร้องเรียน

#### 🔧 Admin (Admin Only)
- `GET /admin/users` - จัดการผู้ใช้
- `PUT /admin/users/:id` - อัปเดตผู้ใช้
- `POST /admin/users/:id/ban` - แบนผู้ใช้
- `POST /admin/users/:id/unban` - ยกเลิกการแบน
- `DELETE /admin/users/:id` - ลบผู้ใช้
- `GET /admin/products` - จัดการสินค้า
- `PUT /admin/products/:id/approve` - อนุมัติสินค้า
- `GET /admin/logs` - ประวัติการกระทำ
- `GET /admin/settings` - การตั้งค่าระบบ
- `PUT /admin/settings` - อัปเดตการตั้งค่า

---

## 🔐 การรักษาความปลอดภัย

### 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Rate Limiting** - Prevent brute force attacks
- **CORS Protection** - Cross-origin resource sharing
- **Helmet.js** - Security headers
- **Input Validation** - Joi schema validation
- **SQL Injection Protection** - Parameterized queries
- **File Upload Security** - Type and size validation

### 🔒 Environment Variables

```bash
# ต้องตั้งค่าใน .env
JWT_SECRET=your_very_long_random_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 🚫 Rate Limiting

```javascript
// 100 requests per 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## 📊 ฐานข้อมูล

### 🗄️ Database Schema

ระบบใช้ **Supabase (PostgreSQL)** เป็นฐานข้อมูลหลัก

#### 📋 Tables หลัก

- **users** - ข้อมูลผู้ใช้
- **admin_users** - ผู้ดูแลระบบ
- **categories** - หมวดหมู่สินค้า
- **products** - สินค้า
- **product_images** - รูปภาพสินค้า
- **rentals** - การเช่า
- **rental_status_history** - ประวัติสถานะการเช่า
- **reviews** - รีวิว
- **chat_conversations** - บทสนทนา
- **chat_messages** - ข้อความ
- **complaints** - ร้องเรียน
- **complaint_attachments** - ไฟล์แนบร้องเรียน
- **notifications** - การแจ้งเตือน
- **payment_transactions** - ธุรกรรมการชำระเงิน
- **user_addresses** - ที่อยู่ผู้ใช้
- **wishlist** - รายการโปรด
- **system_settings** - การตั้งค่าระบบ
- **admin_logs** - ประวัติการกระทำของ admin
- **provinces** - จังหวัด

### 🔧 Database Setup

```bash
# สร้าง schema และ tables
npm run setup
```

---

## 🗄️ Storage Buckets

### 📦 Bucket Configuration

ระบบใช้ **Supabase Storage** สำหรับจัดการไฟล์

#### 🔓 Public Buckets
- **avatars** - รูปโปรไฟล์ผู้ใช้
- **product-images** - รูปภาพสินค้า

#### 🔒 Private Buckets
- **id-verification** - เอกสารยืนยันตัวตน
- **payment-proofs** - หลักฐานการชำระเงิน
- **chat-files** - ไฟล์ในแชท
- **shipping-receipts** - ใบเสร็จการจัดส่ง
- **return-condition-images** - รูปสภาพสินค้าที่ส่งคืน
- **claim-attachments** - ไฟล์แนบการเคลม
- **complaint-attachments** - ไฟล์แนบร้องเรียน

### 🔐 Storage Policies

```sql
-- Public buckets: ใครก็ดูได้, ผู้ใช้ที่ login แล้วอัปโหลดได้
-- Private buckets: เฉพาะผู้ใช้ที่ login แล้วเท่านั้น
```

### 🚀 Storage Setup

```bash
# สร้าง buckets และ policies
npm run setup:buckets
```

---

## 🛠️ การพัฒนา

### 🔧 Development Workflow

1. **Fork** โปรเจค
2. **Clone** repository
3. **Create** feature branch
4. **Make** changes
5. **Test** thoroughly
6. **Commit** with clear messages
7. **Push** to branch
8. **Create** Pull Request

### 📝 Code Style

```javascript
// ใช้ ES6+ features
const example = async () => {
  try {
    const result = await someAsyncFunction();
    return result;
  } catch (error) {
    throw new ApiError(500, 'Something went wrong');
  }
};

// ใช้ meaningful variable names
const userProfile = await getUserProfile(userId);

// ใช้ proper error handling
if (!user) {
  throw new ApiError(404, 'User not found');
}
```

### 🧪 Testing

```bash
# Test server
npm run dev

# Manual testing
curl -X GET http://localhost:3001/api/health
```

### 🔍 Debugging

```bash
# Development mode with debugging
NODE_ENV=development DEBUG=* npm run dev

# Check logs
tail -f logs/app.log
```

---

## 📝 การ Deploy

### 🚀 Production Deployment

#### 1. Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_production_jwt_secret
```

#### 2. Start Server

```bash
# Install dependencies
npm install --production

# Start server
npm run dev

# Or use PM2
pm2 run dev --name "rentease-backend"
```

---

## 🤝 การมีส่วนร่วม

### 📋 Guidelines

1. **Follow** existing code style
2. **Write** clear commit messages
3. **Test** your changes
4. **Document** new features
5. **Update** README if needed

### 🐛 Bug Reports

กรุณาใช้ GitHub Issues สำหรับรายงานปัญหา

### 💡 Feature Requests

ส่ง feature requests ผ่าน GitHub Issues

### 📞 Support

- **Email:** support@rentease.com
- **Documentation:** [API Docs](docs/api.md)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)

---

## 📄 License

This project is licensed under the **NISIO License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - สำหรับ database และ storage
- **Express.js** - สำหรับ web framework
- **Node.js** - สำหรับ runtime environment
- **Community** - สำหรับ feedback และ contributions

---

<div align="center">

**Made with ❤️ by the RentEase Team**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-repo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/rentease)

</div> 