import supabase from './db/supabaseClient.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// รายชื่อตารางทั้งหมดในระบบ
const tables = [
    'provinces',
    'users',
    'admin_users',
    'categories',
    'products',
    'product_images',
    'user_addresses',
    'rentals',
    'rental_status_history',
    'reviews',
    'payout_methods',
    'chat_conversations',
    'chat_messages',
    'complaints',
    'complaint_attachments',
    'notifications',
    'wishlist',
    'payment_transactions',
    'admin_logs',
    'system_settings'
];

// ฟังก์ชันสำหรับดึงข้อมูลจากตาราง
async function getTableData(tableName, limit = 10, saveToFile = false) {
    try {
        console.log(`\n📊 ตาราง: ${tableName}`);
        console.log('='.repeat(50));
        
        // นับจำนวนแถวทั้งหมด
        const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
        if (countError) {
            console.error(`❌ ไม่สามารถนับแถวในตาราง ${tableName}:`, countError.message);
            return null;
        }
        
        console.log(`📈 จำนวนแถวทั้งหมด: ${count} แถว`);
        
        // ดึงข้อมูลตัวอย่าง
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(limit);
            
        if (error) {
            console.error(`❌ ไม่สามารถดึงข้อมูลจากตาราง ${tableName}:`, error.message);
            return null;
        }
        
        let tableInfo = {
            tableName,
            totalRows: count,
            sampleData: data,
            columns: data && data.length > 0 ? Object.keys(data[0]) : []
        };
        
        if (data && data.length > 0) {
            console.log(`📋 ข้อมูลตัวอย่าง (${Math.min(limit, data.length)} แถวแรก):`);
            
            // แสดงชื่อคอลัมน์
            const columns = Object.keys(data[0]);
            console.log(`🏷️  คอลัมน์: ${columns.join(', ')}`);
            
            // แสดงข้อมูลในรูปแบบตาราง
            console.table(data);
        } else {
            console.log('📭 ตารางนี้ยังไม่มีข้อมูล');
        }
        
        return tableInfo;
        
    } catch (error) {
        console.error(`💥 เกิดข้อผิดพลาดในตาราง ${tableName}:`, error.message);
        return null;
    }
}

// ฟังก์ชันสำหรับดึงโครงสร้างตาราง
async function getTableStructure(tableName) {
    try {
        // ใช้ SQL query เพื่อดึงโครงสร้างตาราง
        const { data, error } = await supabase.rpc('get_table_structure', {
            table_name: tableName
        });
        
        if (error) {
            // ถ้าไม่มี function get_table_structure ให้ใช้วิธีอื่น
            console.log(`🏗️  โครงสร้างตาราง ${tableName}: ไม่สามารถดึงข้อมูลโครงสร้างได้`);
            return;
        }
        
        console.log(`🏗️  โครงสร้างตาราง ${tableName}:`);
        console.table(data);
        
    } catch (error) {
        console.log(`🏗️  โครงสร้างตาราง ${tableName}: ไม่สามารถดึงข้อมูลโครงสร้างได้`);
    }
}

// ฟังก์ชันสำหรับบันทึกข้อมูลลงไฟล์ data.md
function saveDataToFile(allTablesData, duration, successCount, errorCount) {
    try {
        const now = new Date();
        const thaiDateTime = now.toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        let content = '';
        
        // ตรวจสอบว่าไฟล์มีอยู่แล้วหรือไม่
        const filePath = path.join(process.cwd(), 'data.md');
        let existingContent = '';
        
        if (fs.existsSync(filePath)) {
            existingContent = fs.readFileSync(filePath, 'utf8');
        }
        
        // สร้างเนื้อหาใหม่
        content += `# 📊 ข้อมูลฐานข้อมูล - ${thaiDateTime}\n\n`;
        content += `## 📈 สรุปการดำเนินการ\n`;
        content += `- **วันเวลาที่ดึงข้อมูล:** ${thaiDateTime}\n`;
        content += `- **ตารางที่ดึงข้อมูลสำเร็จ:** ${successCount} ตาราง\n`;
        content += `- **ตารางที่เกิดข้อผิดพลาด:** ${errorCount} ตาราง\n`;
        content += `- **เวลาที่ใช้:** ${duration.toFixed(2)} วินาที\n`;
        content += `- **จำนวนตารางทั้งหมด:** ${tables.length} ตาราง\n\n`;
        
        // เพิ่มข้อมูลแต่ละตาราง
        allTablesData.forEach((tableInfo, index) => {
            if (tableInfo) {
                content += `## ${index + 1}. ตาราง: ${tableInfo.tableName}\n\n`;
                content += `- **จำนวนแถวทั้งหมด:** ${tableInfo.totalRows} แถว\n`;
                content += `- **คอลัมน์:** ${tableInfo.columns.join(', ')}\n\n`;
                
                if (tableInfo.sampleData && tableInfo.sampleData.length > 0) {
                    content += `### ข้อมูลตัวอย่าง (${tableInfo.sampleData.length} แถวแรก):\n\n`;
                    
                    // สร้างตาราง Markdown
                    if (tableInfo.columns.length > 0) {
                        // Header
                        content += `| ${tableInfo.columns.join(' | ')} |\n`;
                        content += `| ${tableInfo.columns.map(() => '---').join(' | ')} |\n`;
                        
                        // Data rows
                        tableInfo.sampleData.forEach(row => {
                            const values = tableInfo.columns.map(col => {
                                let value = row[col];
                                if (value === null || value === undefined) {
                                    return 'NULL';
                                }
                                if (typeof value === 'object') {
                                    return JSON.stringify(value);
                                }
                                return String(value).replace(/\|/g, '\\|');
                            });
                            content += `| ${values.join(' | ')} |\n`;
                        });
                    }
                } else {
                    content += `### ข้อมูลตัวอย่าง: ไม่มีข้อมูล\n\n`;
                }
                
                content += '\n---\n\n';
            }
        });
        
        // รวมเนื้อหาใหม่กับเนื้อหาเก่า (เพิ่มข้อมูลใหม่ด้านบน)
        const finalContent = content + existingContent;
        
        // บันทึกไฟล์
        fs.writeFileSync(filePath, finalContent, 'utf8');
        
        console.log(`\n✅ บันทึกข้อมูลลงไฟล์ data.md เรียบร้อยแล้ว`);
        console.log(`📁 ตำแหน่งไฟล์: ${filePath}`);
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการบันทึกไฟล์:', error.message);
    }
}

// ฟังก์ชันหลัก
async function viewAllTables(saveToFile = false) {
    console.log('🚀 เริ่มต้นการดูข้อมูลทุกตารางในฐานข้อมูล');
    console.log('=' .repeat(80));
    
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    let allTablesData = [];
    
    for (const tableName of tables) {
        try {
            const tableInfo = await getTableData(tableName, 5); // แสดง 5 แถวแรกของแต่ละตาราง
            if (tableInfo) {
                allTablesData.push(tableInfo);
                successCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            console.error(`💥 เกิดข้อผิดพลาดในตาราง ${tableName}:`, error.message);
            errorCount++;
        }
        
        // หน่วงเวลาเล็กน้อยเพื่อไม่ให้ระบบล้น
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 สรุปผลการดำเนินการ');
    console.log('='.repeat(80));
    console.log(`✅ ตารางที่ดึงข้อมูลสำเร็จ: ${successCount} ตาราง`);
    console.log(`❌ ตารางที่เกิดข้อผิดพลาด: ${errorCount} ตาราง`);
    console.log(`⏱️  เวลาที่ใช้: ${duration.toFixed(2)} วินาที`);
    console.log(`📋 จำนวนตารางทั้งหมด: ${tables.length} ตาราง`);
    
    // บันทึกข้อมูลลงไฟล์ถ้าต้องการ
    if (saveToFile) {
        saveDataToFile(allTablesData, duration, successCount, errorCount);
    }
}

// ฟังก์ชันสำหรับดูข้อมูลตารางเฉพาะ
async function viewSpecificTable(tableName, limit = 10) {
    if (!tables.includes(tableName)) {
        console.error(`❌ ไม่พบตาราง "${tableName}" ในระบบ`);
        console.log(`📋 ตารางที่มีในระบบ: ${tables.join(', ')}`);
        return;
    }
    
    await getTableData(tableName, limit);
}

// ฟังก์ชันสำหรับแสดงรายชื่อตารางทั้งหมด
function listAllTables() {
    console.log('📋 รายชื่อตารางทั้งหมดในระบบ:');
    console.log('='.repeat(50));
    tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table}`);
    });
    console.log(`\n📊 รวมทั้งหมด: ${tables.length} ตาราง`);
}

// ตรวจสอบ command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    // ถ้าไม่มี arguments ให้แสดงข้อมูลทุกตาราง
    viewAllTables().catch(console.error);
} else if (args[0] === 'list') {
    // แสดงรายชื่อตารางทั้งหมด
    listAllTables();
} else if (args[0] === 'save') {
    // ดูข้อมูลทุกตารางและบันทึกลงไฟล์
    viewAllTables(true).catch(console.error);
} else if (args[0] === 'table' && args[1]) {
    // ดูข้อมูลตารางเฉพาะ
    const limit = args[2] ? parseInt(args[2]) : 10;
    viewSpecificTable(args[1], limit).catch(console.error);
} else {
    console.log('📖 วิธีการใช้งาน:');
    console.log('  node view-all-tables.js                    - ดูข้อมูลทุกตาราง');
    console.log('  node view-all-tables.js save               - ดูข้อมูลทุกตารางและบันทึกลงไฟล์ data.md');
    console.log('  node view-all-tables.js list               - แสดงรายชื่อตารางทั้งหมด');
    console.log('  node view-all-tables.js table <ชื่อตาราง> [จำนวนแถว] - ดูข้อมูลตารางเฉพาะ');
    console.log('\nตัวอย่าง:');
    console.log('  node view-all-tables.js save               - ดูข้อมูลทุกตารางและบันทึกลงไฟล์');
    console.log('  node view-all-tables.js table users 20    - ดูข้อมูล 20 แถวแรกของตาราง users');
}