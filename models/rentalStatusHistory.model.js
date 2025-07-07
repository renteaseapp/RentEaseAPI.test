<<<<<<< HEAD
import supabase from '../db/supabaseClient.js';

const RentalStatusHistoryModel = {
    async create(rentalId, newStatus, changedByUserId, notes = null, previousStatus = null) {
        const { data, error } = await supabase
            .from('rental_status_history')
            .insert({
                rental_id: rentalId,
                new_status: newStatus,
                previous_status: previousStatus,
                changed_by_user_id: changedByUserId,
                notes: notes
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating rental status history:', error);
            // Don't throw, as this is a logging table. Log the error for investigation.
        }
        return data;
    }
};

=======
import supabase from '../db/supabaseClient.js';

const RentalStatusHistoryModel = {
    async create(rentalId, newStatus, changedByUserId, notes = null, previousStatus = null) {
        const { data, error } = await supabase
            .from('rental_status_history')
            .insert({
                rental_id: rentalId,
                new_status: newStatus,
                previous_status: previousStatus,
                changed_by_user_id: changedByUserId,
                notes: notes
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating rental status history:', error);
            // Don't throw, as this is a logging table. Log the error for investigation.
        }
        return data;
    }
};

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default RentalStatusHistoryModel; 