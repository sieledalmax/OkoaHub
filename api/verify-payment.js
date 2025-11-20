export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // ============================================
    // HASHPAY CONFIGURATION - UPDATE THESE VALUES
    // ============================================
    const HASHPAY_CONFIG = {
      verifyUrl: 'https://test.paynix.site/payments/api/hashpay/verify-payment/' // HashPay verify endpoint
    };
    // ============================================

    const response = await fetch(
      `${HASHPAY_CONFIG.verifyUrl}${encodeURIComponent(reference)}/`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payment verification failed: ${errorText}`);
    }

    const result = await response.json();

    // HashPay status checking - adapt to their response format
    const status = (result?.status || result?.data?.status || '').toString().toLowerCase();
    const isSuccess = ['completed', 'confirmed', 'success'].includes(status);

    res.status(200).json({
      success: true,
      status: isSuccess ? 'COMPLETED' : 'PENDING', // Map to consistent status
      data: result
    });

  } catch (error) {
    console.error('HashPay verification error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      success: false
    });
  }
}