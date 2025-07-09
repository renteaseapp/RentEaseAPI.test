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
}; 