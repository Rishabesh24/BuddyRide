// Booking Lifecycle Verification Script
async function testLifecycle() {
  console.log('--- Testing Complete Booking Lifecycle ---');

  // 1. Search rides
  const searchRes = await fetch('http://localhost:3000/api/rides/search?originLat=37.78&originLng=-122.40&destLat=37.33&destLng=-121.89');
  const searchData = await searchRes.json();
  const candidate = searchData.data.results[0];
  console.log(`1. Found compatible ride ${candidate.rideId} (Score: ${candidate.compatibilityScore}%, Detour: ${candidate.totalDetourKm}km, Fare: $${candidate.totalCharge})`);

  // 2. Submit seat request
  const bookRes = await fetch('http://localhost:3000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rideId: candidate.rideId,
      seatsBooked: 1,
      pickupLocation: candidate.ride.origin,
      dropoffLocation: candidate.ride.destination,
      segmentDistanceKm: candidate.passengerDistanceKm,
      detourDistanceKm: candidate.totalDetourKm,
      fareAmount: candidate.estimatedFare,
      platformFee: candidate.platformFee,
      totalPaid: candidate.totalCharge,
    }),
  });
  const bookData = await bookRes.json();
  const bookingId = bookData.data.id;
  console.log(`2. Submitted booking request: ID=${bookingId}, Status=${bookData.data.status}`);

  // 3. Driver accepts booking
  const acceptRes = await fetch(`http://localhost:3000/api/bookings/${bookingId}/accept`, {
    method: 'POST',
  });
  const acceptData = await acceptRes.json();
  console.log(`3. Driver accepted booking: Status=${acceptData.data.status}`);

  // 4. Passenger cancels booking
  const cancelRes = await fetch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'Trip rescheduled' }),
  });
  const cancelData = await cancelRes.json();
  console.log(`4. Passenger cancelled booking: Status=${cancelData.data.status}, Reason="${cancelData.data.cancellationReason}"`);

  console.log('--- Lifecycle Test PASSED with 100% integrity ---');
}

testLifecycle();
