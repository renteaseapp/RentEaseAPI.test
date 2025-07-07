<<<<<<< HEAD
import ProductModel from '../models/product.model.js';
import RentalModel from '../models/rental.model.js'; // For future rental stats
import supabase from '../db/supabaseClient.js';

const OwnerService = {
    async getOwnerDashboardStats(ownerId) {
        // 1. Total products
        const { count: totalMyProducts, error: productError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .is('deleted_at', null);

        // 2. Active rentals count (rental_status: 'active')
        const { count: activeRentalsCount, error: activeError } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('rental_status', 'active');

        // 3. Estimated monthly revenue (sum owner_payout_amount ของ rentals ที่จบเดือนนี้และจ่ายเงินแล้ว)
        // เงื่อนไข: owner_id, payment_status = 'paid', actual_return_time ในเดือนนี้
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        const { data: revenueRows, error: revenueError } = await supabase
            .from('rentals')
            .select('owner_payout_amount, actual_return_time')
            .eq('owner_id', ownerId)
            .eq('payment_status', 'paid')
            .gte('actual_return_time', monthStart)
            .lte('actual_return_time', monthEnd);
        let estimatedMonthlyRevenue = 0;
        if (revenueRows && Array.isArray(revenueRows)) {
            estimatedMonthlyRevenue = revenueRows.reduce((sum, r) => sum + (parseFloat(r.owner_payout_amount) || 0), 0);
        }

        // 4. Pending rental requests (rental_status: 'pending_owner_approval')
        const { count: pendingRentalRequestsCount, error: pendingError } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('rental_status', 'pending_owner_approval');

        if (productError) console.error("Error fetching owner product count:", productError);
        if (activeError) console.error("Error fetching active rentals count:", activeError);
        if (revenueError) console.error("Error fetching monthly revenue:", revenueError);
        if (pendingError) console.error("Error fetching pending rental requests:", pendingError);

        return {
            total_my_products: totalMyProducts || 0,
            active_rentals_count: activeRentalsCount || 0,
            estimated_monthly_revenue: estimatedMonthlyRevenue,
            pending_rental_requests_count: pendingRentalRequestsCount || 0,
            // recent_notifications: [], // TODO
            // upcoming_returns: [], // TODO
            // pending_rental_requests_summary: [] // TODO
        };
    },
    async updateRentalDeliveryStatus(rentalId, { delivery_status, tracking_number, carrier_code }) {
        const { data, error } = await supabase
            .from('rentals')
            .update({ delivery_status, tracking_number, carrier_code })
            .eq('id', rentalId)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },
    async getOwnerReport(ownerId) {
        // DEBUG LOG
        console.log('ownerId', ownerId);
        // 1. สินค้า
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .is('deleted_at', null);

        const { count: productsAvailable } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('availability_status', 'available')
            .is('deleted_at', null);

        const { count: productsRentedOut } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('availability_status', 'rented_out')
            .is('deleted_at', null);

        // 2. การเช่า
        const { count: totalRentals } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId);

        const { count: completedRentals } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('rental_status', 'completed');

        const { count: cancelledRentals } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .in('rental_status', ['cancelled_by_renter', 'cancelled_by_owner', 'rejected_by_owner']);

        // 3. รายได้รวม/รายได้เดือนนี้ (แก้ logic ตรงนี้)
        const { data: revenueRows } = await supabase
            .from('rentals')
            .select('owner_payout_amount, final_amount_paid, total_amount_due, platform_fee_owner, actual_return_time, payment_status, rental_status, id')
            .eq('owner_id', ownerId)
            .eq('payment_status', 'paid');
        console.log('revenueRows', revenueRows);
        let totalRevenue = 0, revenueThisMonth = 0;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        if (revenueRows && Array.isArray(revenueRows)) {
            totalRevenue = revenueRows.reduce((sum, r) => {
                let payout = r.owner_payout_amount;
                if (payout == null) {
                    // fallback: final_amount_paid - platform_fee_owner
                    const base = r.final_amount_paid ?? r.total_amount_due ?? 0;
                    payout = base - (r.platform_fee_owner ?? 0);
                }
                return sum + (parseFloat(payout) || 0);
            }, 0);
            revenueThisMonth = revenueRows
                .filter(r => r.actual_return_time && new Date(r.actual_return_time) >= monthStart && new Date(r.actual_return_time) <= monthEnd)
                .reduce((sum, r) => {
                    let payout = r.owner_payout_amount;
                    if (payout == null) {
                        const base = r.final_amount_paid ?? r.total_amount_due ?? 0;
                        payout = base - (r.platform_fee_owner ?? 0);
                    }
                    return sum + (parseFloat(payout) || 0);
                }, 0);
        }

        // 4. คะแนนรีวิว/จำนวนรีวิว
        const { data: reviewStats } = await supabase
            .from('reviews')
            .select('rating_owner')
            .eq('owner_id', ownerId);
        let averageRating = 0, totalReviews = 0;
        if (reviewStats && reviewStats.length > 0) {
            totalReviews = reviewStats.length;
            averageRating = reviewStats.reduce((sum, r) => sum + (parseFloat(r.rating_owner) || 0), 0) / totalReviews;
            averageRating = Math.round(averageRating * 100) / 100;
        }

        // 5. จำนวนร้องเรียน
        const { count: totalComplaints } = await supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('complainant_id', ownerId);

        // 6. รายการ payout ล่าสุด
        const { data: recentPayouts } = await supabase
            .from('payment_transactions')
            .select('amount, status, transaction_time')
            .eq('user_id', ownerId)
            .eq('transaction_type', 'rental_fee_payout')
            .order('transaction_time', { ascending: false })
            .limit(5);

        // Top 3 popular products by rental count (JS aggregate only)
        const { data: rentalsAll } = await supabase
            .from('rentals')
            .select('product_id, owner_id, owner_payout_amount, final_amount_paid, total_amount_due, platform_fee_owner, payment_status, rental_status')
            .eq('owner_id', ownerId);

        // Query product titles
        const productIds = [...new Set((rentalsAll || []).map(r => r.product_id).filter(Boolean))];
        let productTitles = {};
        if (productIds.length > 0) {
            const { data: productsData } = await supabase
                .from('products')
                .select('id, title')
                .in('id', productIds);
            (productsData || []).forEach(p => { productTitles[p.id] = p.title; });
        }

        // Aggregate
        const productStats = {};
        (rentalsAll || []).forEach(r => {
            if (!r.product_id) return;
            if (!productStats[r.product_id]) productStats[r.product_id] = { product_id: r.product_id, rental_count: 0, total_revenue: 0 };
            productStats[r.product_id].rental_count++;
            // รวมรายได้เฉพาะ rental ที่จ่ายเงินสำเร็จและจบจริง
            if (r.payment_status === 'paid' && r.rental_status === 'completed') {
                let payout = r.owner_payout_amount;
                if (payout == null) {
                    const base = r.final_amount_paid ?? r.total_amount_due ?? 0;
                    payout = base - (r.platform_fee_owner ?? 0);
                }
                productStats[r.product_id].total_revenue += parseFloat(payout) || 0;
            }
        });
        const topProducts = Object.values(productStats)
            .map(p => ({ ...p, title: productTitles[p.product_id] || '' }))
            .sort((a, b) => b.rental_count - a.rental_count)
            .slice(0, 3);

        return {
            total_products: totalProducts || 0,
            products_available: productsAvailable || 0,
            products_rented_out: productsRentedOut || 0,
            total_rentals: totalRentals || 0,
            completed_rentals: completedRentals || 0,
            cancelled_rentals: cancelledRentals || 0,
            total_revenue: totalRevenue,
            revenue_this_month: revenueThisMonth,
            average_rating: averageRating,
            total_reviews: totalReviews,
            total_complaints: totalComplaints || 0,
            recent_payouts: recentPayouts || [],
            top_products: topProducts
        };
    }
};

=======
import ProductModel from '../models/product.model.js';
import RentalModel from '../models/rental.model.js'; // For future rental stats
import supabase from '../db/supabaseClient.js';

const OwnerService = {
    async getOwnerDashboardStats(ownerId) {
        // 1. Total products
        const { count: totalMyProducts, error: productError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .is('deleted_at', null);

        // 2. Active rentals count (rental_status: 'active')
        const { count: activeRentalsCount, error: activeError } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('rental_status', 'active');

        // 3. Estimated monthly revenue (sum owner_payout_amount ของ rentals ที่จบเดือนนี้และจ่ายเงินแล้ว)
        // เงื่อนไข: owner_id, payment_status = 'paid', actual_return_time ในเดือนนี้
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        const { data: revenueRows, error: revenueError } = await supabase
            .from('rentals')
            .select('owner_payout_amount, actual_return_time')
            .eq('owner_id', ownerId)
            .eq('payment_status', 'paid')
            .gte('actual_return_time', monthStart)
            .lte('actual_return_time', monthEnd);
        let estimatedMonthlyRevenue = 0;
        if (revenueRows && Array.isArray(revenueRows)) {
            estimatedMonthlyRevenue = revenueRows.reduce((sum, r) => sum + (parseFloat(r.owner_payout_amount) || 0), 0);
        }

        // 4. Pending rental requests (rental_status: 'pending_owner_approval')
        const { count: pendingRentalRequestsCount, error: pendingError } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('rental_status', 'pending_owner_approval');

        if (productError) console.error("Error fetching owner product count:", productError);
        if (activeError) console.error("Error fetching active rentals count:", activeError);
        if (revenueError) console.error("Error fetching monthly revenue:", revenueError);
        if (pendingError) console.error("Error fetching pending rental requests:", pendingError);

        return {
            total_my_products: totalMyProducts || 0,
            active_rentals_count: activeRentalsCount || 0,
            estimated_monthly_revenue: estimatedMonthlyRevenue,
            pending_rental_requests_count: pendingRentalRequestsCount || 0,
            // recent_notifications: [], // TODO
            // upcoming_returns: [], // TODO
            // pending_rental_requests_summary: [] // TODO
        };
    },
    async updateRentalDeliveryStatus(rentalId, { delivery_status, tracking_number, carrier_code }) {
        const { data, error } = await supabase
            .from('rentals')
            .update({ delivery_status, tracking_number, carrier_code })
            .eq('id', rentalId)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    }
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default OwnerService; 