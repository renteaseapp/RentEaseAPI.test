import cron from 'node-cron';
import RentalService from './rental.service.js';

class SchedulerService {
    constructor() {
        this.jobs = new Map();
    }

    /**
     * เริ่มต้น scheduler ทั้งหมด
     */
    startAllSchedulers() {
        this.startRentalNotificationScheduler();
        console.log('✅ All schedulers started successfully');
    }

    /**
     * หยุด scheduler ทั้งหมด
     */
    stopAllSchedulers() {
        this.jobs.forEach((job, name) => {
            job.stop();
            console.log(`🛑 Stopped scheduler: ${name}`);
        });
        this.jobs.clear();
        console.log('✅ All schedulers stopped');
    }

    /**
     * เริ่มต้น scheduler สำหรับการแจ้งเตือนการเช่า
     * รันทุกวันเวลา 09:00 น.
     */
    startRentalNotificationScheduler() {
        const jobName = 'rental-notifications';
        
        // หยุด job เดิมถ้ามี
        if (this.jobs.has(jobName)) {
            this.jobs.get(jobName).stop();
        }

        // สร้าง cron job ใหม่
        const job = cron.schedule('0 9 * * *', async () => {
            try {
                console.log('🔄 Running rental notification scheduler...');
                const result = await RentalService.notifyDueAndOverdueRentals();
                console.log(`✅ Rental notification completed:`, {
                    dueSoon: result.dueSoon,
                    overdue: result.overdue,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('❌ Error in rental notification scheduler:', error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Bangkok"
        });

        this.jobs.set(jobName, job);
        console.log(`✅ Started scheduler: ${jobName} (runs daily at 09:00 Bangkok time)`);
    }

    /**
     * รัน rental notification ทันที (สำหรับทดสอบ)
     */
    async runRentalNotificationNow() {
        try {
            console.log('🔄 Running rental notification manually...');
            const result = await RentalService.notifyDueAndOverdueRentals();
            console.log(`✅ Manual rental notification completed:`, {
                dueSoon: result.dueSoon,
                overdue: result.overdue,
                timestamp: new Date().toISOString()
            });
            return result;
        } catch (error) {
            console.error('❌ Error in manual rental notification:', error);
            throw error;
        }
    }

    /**
     * ดูสถานะของ schedulers ทั้งหมด
     */
    getSchedulerStatus() {
        const status = {};
        this.jobs.forEach((job, name) => {
            status[name] = {
                running: job.running,
                scheduled: job.scheduled
            };
        });
        return status;
    }

    /**
     * เริ่มต้น scheduler เฉพาะ
     */
    startScheduler(schedulerName) {
        switch (schedulerName) {
            case 'rental-notifications':
                this.startRentalNotificationScheduler();
                break;
            default:
                throw new Error(`Unknown scheduler: ${schedulerName}`);
        }
    }

    /**
     * หยุด scheduler เฉพาะ
     */
    stopScheduler(schedulerName) {
        if (this.jobs.has(schedulerName)) {
            this.jobs.get(schedulerName).stop();
            this.jobs.delete(schedulerName);
            console.log(`🛑 Stopped scheduler: ${schedulerName}`);
        } else {
            throw new Error(`Scheduler not found: ${schedulerName}`);
        }
    }
}

// สร้าง singleton instance
const schedulerService = new SchedulerService();

export default schedulerService;