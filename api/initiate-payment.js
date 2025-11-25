export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, amount, loan_amount } = req.body;

    // Validate input
    if (!phone_number || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ============================================
    // HASHPAY CONFIGURATION - UPDATE THESE VALUES
    // ============================================
    const HASHPAY_CONFIG = {
      apiUrl: 'https://test.paynix.site/payments/api/hashpay/stk-push/', // HashPay STK endpoint
      platform: 'HP960345' // ⚠️ CHANGE THIS: Your HashPay platform ID
    };
    // ============================================

    // Generate a unique reference
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const payload = {
      amount: parseInt(amount),
      phone_number: phone_number,
      reference: `TYN-${timestamp}-${randomStr}`, // Unique transaction reference
      platform: HASHPAY_CONFIG.platform // HashPay platform identifier
    };

    const response = await fetch(HASHPAY_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payment initiation failed: ${errorText}`);
    }

    const result = await response.json();

    // HashPay returns checkout_request_id as payment reference
    const paymentReference = result?.checkout_request_id || result?.reference;

    if (!paymentReference) {
      throw new Error('No payment reference received from HashPay');
    }

    res.status(200).json({
      success: true,
      reference: paymentReference, // HashPay payment reference
      external_reference: payload.reference // Our internal reference
    });

  } catch (error) {
    console.error('HashPay initiation error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}