<<<<<<< HEAD
async function getRentalDeliveryStatus(rentalId, renterId) {
  const { data, error } = await supabase
    .from('rentals')
    .select('id, delivery_status, tracking_number, carrier_code')
    .eq('id', rentalId)
    .eq('renter_id', renterId)
    .single();
  if (error) throw error;
  return data;
}

export default {
  getRentalDeliveryStatus,
=======
async function getRentalDeliveryStatus(rentalId, renterId) {
  const { data, error } = await supabase
    .from('rentals')
    .select('id, delivery_status, tracking_number, carrier_code')
    .eq('id', rentalId)
    .eq('renter_id', renterId)
    .single();
  if (error) throw error;
  return data;
}

export default {
  getRentalDeliveryStatus,
>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
}; 