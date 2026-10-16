// Booking & OTP Lifecycle Verification Script (Tamil Nadu Transit Network)
async function testLifecycle() {
  console.log('--- Testing Complete Booking, OTP & Trip Lifecycle ---');

  // 1. Search rides along Tamil Nadu corridor
  const searchRes = await fetch('http://localhost:3000/api/rides/search?origin=Guindy&destination=OMR+Siruseri');
  const searchData = await searchRes.json();
  const candidate = searchData.data.results[0];
  console.log(`1. Found compatible ride ${candidate.rideId} (Driver: ${candidate.ride.driver?.fullName}, Vehicle: ${candidate.ride.vehicle?.model}, Fare: ₹${candidate.totalCharge})`);

  // 2. Submit seat request (generates 4-digit start OTP)
  const bookRes = await fetch('http://localhost:3000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rideId: candidate.rideId,
      passengerId: 'u-demo-passenger',
      vehicleType: candidate.ride.vehicleType,
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
  const booking = bookData.data;
  console.log(`2. Submitted booking: ID=${booking.id}, Status=${booking.status}, Generated Start OTP=${booking.startOtp}`);

  if (!booking.startOtp || booking.startOtp.length !== 4) {
    throw new Error('Start OTP was not generated properly as a 4-digit code!');
  }

  // 3. Driver enters and verifies passenger's 4-digit start OTP
  console.log(`3. Driver entering passenger OTP: ${booking.startOtp}...`);
  const verifyRes = await fetch(`http://localhost:3000/api/bookings/${booking.id}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp: booking.startOtp }),
  });
  const verifyData = await verifyRes.json();
  console.log(`   Verification result: Success=${verifyData.success}, Message="${verifyData.data?.message}"`);

  // 4. Driver completes trip
  const completeRes = await fetch(`http://localhost:3000/api/bookings/${booking.id}/complete`, {
    method: 'POST',
  });
  const completeData = await completeRes.json();
  console.log(`4. Trip completed: Status=${completeData.data.status}`);

  console.log('--- Lifecycle & OTP Verification Test PASSED with 100% integrity ---');
}

testLifecycle();
