// api/check-payment-status.js
// Check payment status from PayHero

require('dotenv').config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment reference is required' 
      });
    }

    // Get PayHero credentials
    const apiUsername = process.env.PAYHERO_USERNAME;
    const apiPassword = process.env.PAYHERO_PASSWORD;

    if (!apiUsername || !apiPassword) {
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // Create Basic Auth token
    const credentials = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
    const authToken = `Basic ${credentials}`;

    // Query PayHero for payment status
    const response = await fetch(
      `https://backend.payhero.co.ke/api/v2/payments?external_reference=${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        message: 'Failed to check payment status',
        details: data
      });
    }

    // Return payment status
    return res.status(200).json({ 
      success: true, 
      data: data
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking payment status',
      error: error.message
    });
  }
}