const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { name, phone, password, ownerCode } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ success: false, message: 'Phone already registered' });

    const isOwner = Boolean(process.env.OWNER_CODE) && ownerCode === process.env.OWNER_CODE;
    const user = await User.create({ name, phone, password, role: isOwner ? 'owner' : 'customer' });
    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    res.json({
      success: true,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, addresses: user.addresses },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { label, fullAddress, pincode, landmark } = req.body;
    const user = await User.findById(req.user._id);
    user.addresses.push({ label, fullAddress, pincode, landmark });
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
