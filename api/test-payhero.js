export default async function handler(req, res) {
  const apiUsername = process.env.PAYHERO_USERNAME;
  const apiPassword = process.env.PAYHERO_PASSWORD;
  const channelId = process.env.PAYHERO_CHANNEL_ID;

  // Create Basic Auth token
  const credentials = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
  const authToken = `Basic ${credentials}`;

  try {
    // Test with a simple GET request to PayHero
    const response = await fetch('https://backend.payhero.co.ke/api/v2/payment_channels', {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      authenticated: response.ok,
      response: data
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}