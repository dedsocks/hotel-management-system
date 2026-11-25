const pool = require('../config/db');

exports.getMenuItems = async (req, res) => {
  try {
    await pool.query(
      `UPDATE MenuItem
       SET Name = 'Herb-Roasted Heritage Turkey Roulade',
           Description = 'Slow-roasted turkey breast with cranberry-port reduction and truffle jus',
           Price = 4600.00
       WHERE Item_ID = 'mi-02' AND Name LIKE '%Ribeye%'`
    );
    const [rows] = await pool.query(
      `SELECT Item_ID, Name, Description, Category, Price FROM MenuItem ORDER BY Category, Name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

exports.getFoodOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT fo.Order_ID, fo.Reservation_ID, fo.Order_Time, fo.Total_Amount, fo.Order_Status,
              CONCAT(g.First_Name, ' ', g.Last_Name) AS Guest_Name,
              rm.Room_Number
       FROM FoodOrder fo
       JOIN Reservations r ON fo.Reservation_ID = r.Reservation_ID
       JOIN Guest g ON r.Guest_ID = g.Guest_ID
       JOIN Rooms rm ON r.Room_ID = rm.Room_ID
       ORDER BY fo.Order_Time DESC`
    );

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.Order_ID);
      const [items] = await pool.query(
        `SELECT foi.Order_ID, foi.Item_ID, foi.Quantity, foi.Subtotal_Price, mi.Name, mi.Category
         FROM FoodOrderItem foi
         JOIN MenuItem mi ON foi.Item_ID = mi.Item_ID
         WHERE foi.Order_ID IN (?)`,
        [orderIds]
      );

      const itemsByOrder = {};
      for (const item of items) {
        if (!itemsByOrder[item.Order_ID]) itemsByOrder[item.Order_ID] = [];
        itemsByOrder[item.Order_ID].push(item);
      }
      for (const order of orders) {
        order.items = itemsByOrder[order.Order_ID] || [];
      }
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching food orders:', err);
    res.status(500).json({ error: 'Failed to fetch food orders' });
  }
};

exports.createFoodOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { reservationId, guestId, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'At least one menu item is required.' });
    }

    // Enforce that the guest is currently Checked-In at the hotel
    let actualReservationId = null;
    if (reservationId) {
      const [resCheck] = await connection.query(
        `SELECT Reservation_ID, Booking_Status FROM Reservations WHERE Reservation_ID = ? LIMIT 1`,
        [reservationId]
      );
      if (resCheck.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Reservation not found.' });
      }
      if (resCheck[0].Booking_Status !== 'Checked-In') {
        await connection.rollback();
        return res.status(403).json({ error: 'Guest must be currently checked in at the hotel to order room service.' });
      }
      actualReservationId = resCheck[0].Reservation_ID;
    } else if (guestId) {
      const [guestRes] = await connection.query(
        `SELECT Reservation_ID FROM Reservations WHERE Guest_ID = ? AND Booking_Status = 'Checked-In' ORDER BY Created_At DESC LIMIT 1`,
        [guestId]
      );
      if (guestRes.length === 0) {
        await connection.rollback();
        return res.status(403).json({ error: 'You must be currently checked in at the hotel to order in-room dining.' });
      }
      actualReservationId = guestRes[0].Reservation_ID;
    } else {
      await connection.rollback();
      return res.status(400).json({ error: 'Guest or reservation information is required.' });
    }

    const itemIds = items.map((i) => i.itemId);
    const [menuRows] = await connection.query(
      `SELECT Item_ID, Name, Price FROM MenuItem WHERE Item_ID IN (?)`,
      [itemIds]
    );
    const menuMap = new Map(menuRows.map((m) => [m.Item_ID, m]));

    let totalAmount = 0;
    const orderItems = [];
    for (const reqItem of items) {
      const menu = menuMap.get(reqItem.itemId);
      if (!menu) continue;
      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      const subtotal = Number(menu.Price) * qty;
      totalAmount += subtotal;
      orderItems.push({ itemId: menu.Item_ID, name: menu.Name, quantity: qty, subtotal });
    }

    if (orderItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No valid menu items found.' });
    }

    const orderId = 'ord-' + Math.floor(1000 + Math.random() * 9000);
    await connection.query(
      `INSERT INTO FoodOrder (Order_ID, Reservation_ID, Total_Amount, Order_Status)
       VALUES (?, ?, ?, 'Placed')`,
      [orderId, actualReservationId, totalAmount]
    );

    for (const oi of orderItems) {
      await connection.query(
        `INSERT INTO FoodOrderItem (Order_ID, Item_ID, Quantity, Subtotal_Price)
         VALUES (?, ?, ?, ?)`,
        [orderId, oi.itemId, oi.quantity, oi.subtotal]
      );
    }

    // Post charge to the reservation's Invoice
    const [invoices] = await connection.query(
      `SELECT Invoice_ID FROM Invoice WHERE Reservation_ID = ? LIMIT 1`,
      [actualReservationId]
    );

    if (invoices.length > 0) {
      const invoiceId = invoices[0].Invoice_ID;
      const invoiceItemId = 'item-' + Math.floor(1000 + Math.random() * 9000);
      const summaryDesc = `In-Room Dining (${orderItems.map((i) => `${i.quantity}x ${i.name}`).join(', ')})`;

      await connection.query(
        `INSERT INTO InvoiceItem (InvoiceItem_ID, Invoice_ID, Description, Charge_Category, Amount)
         VALUES (?, ?, ?, 'Dining', ?)`,
        [invoiceItemId, invoiceId, summaryDesc.slice(0, 250), totalAmount]
      );

      await connection.query(
        `UPDATE Invoice
         SET Total_Charges = Total_Charges + ?,
             Net_Payable = Net_Payable + ?
         WHERE Invoice_ID = ?`,
        [totalAmount, totalAmount, invoiceId]
      );
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      orderId,
      totalAmount,
      message: 'Dining order placed and posted to room folio.'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating food order:', err);
    res.status(500).json({ error: 'Failed to place dining order' });
  } finally {
    connection.release();
  }
};

exports.updateFoodOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Placed', 'Preparing', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    await pool.query(
      `UPDATE FoodOrder SET Order_Status = ? WHERE Order_ID = ?`,
      [status, id]
    );

    res.json({ success: true, status });
  } catch (err) {
    console.error('Error updating food order status:', err);
    res.status(500).json({ error: 'Failed to update food order status' });
  }
};
