// api/payment-callback.js
// This endpoint receives payment confirmation from PayHero

export default async function handler(req, res) {
  // PayHero sends POST requests for callbacks
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const callbackData = req.body;
    
    console.log('Payment callback received:', callbackData);

    // PayHero callback structure includes:
    // - status: 'success', 'failed', 'pending'
    // - amount: payment amount
    // - phone_number: customer phone
    // - external_reference: your reference
    // - transaction_reference: PayHero reference
    // - mpesa_reference: M-Pesa confirmation code

    const { 
      status, 
      amount, 
      phone_number, 
      external_reference,
      transaction_reference,
      mpesa_reference 
    } = callbackData;

    // Log payment status
    if (status === 'success') {
      console.log(`✅ Payment successful: ${mpesa_reference} - Amount: ${amount}`);
      
      // Here you can:
      // 1. Update your database with payment status
      // 2. Send confirmation SMS/email to customer
      // 3. Trigger loan disbursement
      // 4. Store transaction details
      
      // Example: Store in database (you'll need to implement this)
      // await savePaymentToDatabase({
      //   reference: external_reference,
      //   mpesa_ref: mpesa_reference,
      //   amount: amount,
      //   phone: phone_number,
      //   status: 'completed',
      //   timestamp: new Date()
      // });

    } else if (status === 'failed') {
      console.log(`❌ Payment failed: ${external_reference}`);
      
      // Handle failed payment
      // - Update database
      // - Notify customer
      // - Log for retry
      
    } else if (status === 'pending') {
      console.log(`⏳ Payment pending: ${external_reference}`);
    }

    // Always return 200 OK to acknowledge receipt
    return res.status(200).json({ 
      success: true, 
      message: 'Callback received',
      reference: external_reference
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Still return 200 to prevent PayHero from retrying
    return res.status(200).json({ 
      success: false, 
      message: 'Callback processed with errors',
      error: error.message
    });
  }
}