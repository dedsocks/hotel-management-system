const pool = require('../config/db');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, error: 'Coupon code is required.' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const [rows] = await pool.query(
      `SELECT Coupon_Code, Discount_Percentage, Max_Discount_Amount, Expiry_Date
       FROM Coupon
       WHERE UPPER(Coupon_Code) = ?`,
      [normalizedCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'Invalid promotional code.' });
    }

    const coupon = rows[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(coupon.Expiry_Date);

    if (expiry < today) {
      return res.status(400).json({ valid: false, error: 'This promotional code has expired.' });
    }

    const discountPct = Number(coupon.Discount_Percentage);
    const maxDiscount = Number(coupon.Max_Discount_Amount);
    const rawDiscount = (Number(subtotal) * discountPct) / 100;
    const appliedDiscount = maxDiscount > 0 ? Math.min(rawDiscount, maxDiscount) : rawDiscount;

    res.json({
      valid: true,
      couponCode: coupon.Coupon_Code,
      discountPercentage: discountPct,
      maxDiscountAmount: maxDiscount,
      appliedDiscount: Math.round(appliedDiscount * 100) / 100,
      expiryDate: coupon.Expiry_Date
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ valid: false, error: 'Failed to validate coupon.' });
  }
};
