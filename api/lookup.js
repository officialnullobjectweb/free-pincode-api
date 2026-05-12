const pincodeDirectory = require('india-pincode-lookup');

export default function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ error: 'Provide a valid 6-digit pincode' });
  }

  const results = pincodeDirectory.lookup(pincode);

  if (results && results.length > 0) {
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({
      success: true,
      pincode: pincode,
      district: results[0].districtName,
      state: results[0].stateName,
      all_offices: results
    });
  }

  return res.status(404).json({ success: false, message: 'Pincode not found' });
}