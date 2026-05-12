export default async function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'Provide a valid 6-digit pincode' });
  }

  try {
    // Using India Post Pincode API (free, no authentication)
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
      const offices = data[0].PostOffice;
      const firstOffice = offices[0];

      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
      return res.status(200).json({
        success: true,
        pincode: pincode,
        district: firstOffice.District || '',
        state: firstOffice.State || '',
        all_offices: offices.map(o => ({
          name: o.Name,
          branchType: o.BranchType,
          deliveryStatus: o.DeliveryStatus
        }))
      });
    }

    return res.status(404).json({ success: false, message: 'Pincode not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch pincode data' });
  }
}