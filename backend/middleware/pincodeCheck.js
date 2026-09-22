// Blocks any checkout/address request that isn't for the one serviceable pincode.
const checkPincode = (req, res, next) => {
  const allowed = process.env.ALLOWED_PINCODE || '712310';
  const pincode = req.body?.deliveryAddress?.pincode || req.body?.pincode || req.query?.pincode;

  if (!pincode) {
    return res.status(400).json({ success: false, message: 'Pincode is required' });
  }
  if (String(pincode).trim() !== allowed) {
    return res.status(400).json({
      success: false,
      message: `Sorry, we currently deliver only to pincode ${allowed}.`
    });
  }
  next();
};

module.exports = checkPincode;
