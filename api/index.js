export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pincode } = req.query;

  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'Provide a valid 6-digit pincode' });
  }

  return fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Failed to fetch pincode data' });
    });
}