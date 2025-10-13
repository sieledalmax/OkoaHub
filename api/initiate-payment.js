// api/initiate-payment.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { phone_number, amount, customer_name, loan_amount } = req.body;

    // Validate input
    if (!phone_number || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and amount are required' 
      });
    }

    // Format phone number (remove +254 or 0, add 254)
    let formattedPhone = phone_number.toString().trim();
    if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Get PayHero credentials from environment variables
    const apiUsername = process.env.PAYHERO_USERNAME;
    const apiPassword = process.env.PAYHERO_PASSWORD;
    const channelId = process.env.PAYHERO_CHANNEL_ID;

    if (!apiUsername || !apiPassword || !channelId) {
      console.error('Missing PayHero credentials');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // Create Basic Auth token
    const credentials = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
    const authToken = `Basic ${credentials}`;

    // Generate unique reference
    const reference = `OKOA-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Prepare payment request
    const paymentData = {
      amount: parseInt(amount),
      phone_number: formattedPhone,
      channel_id: parseInt(channelId),
      provider: 'mpesa',
      external_reference: reference,
      callback_url: `${req.headers.origin || 'https://your-domain.vercel.app'}/api/payment-callback`,
      description: `OkoaHub Loan Processing Fee - Ksh ${loan_amount || amount}`
    };

    console.log('Initiating payment:', { ...paymentData, phone_number: '***' + formattedPhone.slice(-4) });

    // Make request to PayHero API
    const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('PayHero API error:', responseData);
      return res.status(response.status).json({ 
        success: false, 
        message: responseData.message || 'Payment initiation failed',
        details: responseData
      });
    }

    // Success response
    return res.status(200).json({ 
      success: true, 
      message: 'STK Push sent successfully. Please check your phone.',
      reference: reference,
      data: responseData
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request',
      error: error.message
    });
  }
}