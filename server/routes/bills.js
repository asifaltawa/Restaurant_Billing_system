import express from 'express';
import Order from '../models/Order.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Helper function to format INR
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate bill for an order
router.get('/order/:orderId', async (req, res) => {
  try {
    console.log('Generating bill for order:', req.params.orderId);
    
    const order = await Order.findById(req.params.orderId)
      .populate('items.menuItem');
    
    if (!order) {
      console.error('Order not found:', req.params.orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create a PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${order._id}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add restaurant header
    doc.fontSize(25).font('Helvetica-Bold').text('Restaurant Bill', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text('Thank you for dining with us!', { align: 'center' });
    doc.moveDown();

    // Add a line separator
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();

    // Add order details
    doc.fontSize(12).font('Helvetica');
    const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    
    // Create a table-like structure for order details
    doc.text('Bill Details', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Bill No: ${order._id.toString().slice(-8).toUpperCase()}`, { continued: true });
    doc.text(`Date: ${orderDate}`, { align: 'right' });
    doc.text(`Table Number: ${order.tableNumber}`);
    doc.moveDown();

    // Add items table header with currency indicator
    const tableTop = doc.y + 10;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Rate (₹)', 370, tableTop);
    doc.text('Amount (₹)', 470, tableTop);

    // Add a line for table header
    doc.moveTo(50, doc.y + 5)
       .lineTo(550, doc.y + 5)
       .stroke();

    // Add items
    let tableY = doc.y + 15;
    doc.font('Helvetica');
    
    // Calculate totals
    let subtotal = 0;
    
    // Validate and add items
    for (const item of order.items) {
      if (!item || !item.menuItem) {
        console.warn('Skipping invalid item:', item);
        continue;
      }

      try {
        const itemName = item.menuItem.name.length > 25 
          ? item.menuItem.name.substring(0, 22) + '...'
          : item.menuItem.name;

        const amount = item.quantity * item.price;
        subtotal += amount;

        doc.text(itemName, 50, tableY);
        doc.text(item.quantity.toString(), 300, tableY);
        // Remove ₹ symbol since it's in the header
        doc.text(item.price.toLocaleString('en-IN'), 370, tableY);
        doc.text(amount.toLocaleString('en-IN'), 470, tableY);
        tableY += 20;
      } catch (err) {
        console.error('Error adding item to PDF:', err);
      }
    }

    // Add a line before totals
    doc.moveTo(50, tableY + 5)
       .lineTo(550, tableY + 5)
       .stroke();
    tableY += 20;

    // Add totals section with validation
    const totalsX = 370;
    doc.font('Helvetica');
    
    // Calculate tax and total
    const tax = Math.round(subtotal * 0.1); // 10% tax, rounded to nearest integer
    const total = subtotal + tax;

    // Right align the amounts
    const amountX = 470;
    
    doc.text('Subtotal:', totalsX, tableY);
    doc.text(subtotal.toLocaleString('en-IN'), amountX, tableY);
    tableY += 20;

    doc.text('GST (10%):', totalsX, tableY);
    doc.text(tax.toLocaleString('en-IN'), amountX, tableY);
    tableY += 20;

    doc.font('Helvetica-Bold');
    doc.text('Grand Total:', totalsX, tableY);
    doc.text(total.toLocaleString('en-IN'), amountX, tableY);
    
    // Add a box around the total
    const totalBoxY = tableY - 5;
    doc.rect(totalsX - 10, totalBoxY, 200, 25).stroke();
    
    // Add payment details if paid
    if (order.paymentStatus === 'paid') {
      tableY += 40;
      doc.font('Helvetica-Bold');
      doc.text('Payment Information', 50, tableY);
      tableY += 20;
      doc.font('Helvetica');
      doc.text(`Status: Paid`, 50, tableY);
      tableY += 20;
      doc.text(`Method: ${order.paymentMethod.toUpperCase()}`, 50, tableY);
      doc.text(`Amount Paid: ${total.toLocaleString('en-IN')}`, 300, tableY);
      doc.text(`Date: ${new Date(order.updatedAt).toLocaleString('en-IN')}`, 50, tableY + 20);
    }

    // Add footer
    doc.font('Helvetica');
    doc.fontSize(10);
    doc.text('Thank you for your business!', 50, 700, { align: 'center' });
    doc.text('Please visit again', 50, 720, { align: 'center' });

    // Add terms and conditions
    doc.fontSize(8);
    doc.text('Terms & Conditions:', 50, 740);
    doc.text('1. All prices are inclusive of GST', 50, 755);
    doc.text('2. This is a computer generated bill', 50, 765);
    doc.text('3. All amounts are in Indian Rupees (₹)', 50, 775);

    console.log('Finalizing PDF generation');
    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating bill:', error);
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Failed to generate bill',
        error: error.message,
        stack: error.stack
      });
    }
  }
});

// Get daily sales report
router.get('/daily-report', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
      createdAt: { $gte: today },
      paymentStatus: 'paid'
    });

    const report = {
      date: today,
      totalOrders: orders.length,
      totalSales: orders.reduce((sum, order) => sum + order.total, 0),
      paymentMethods: {
        cash: orders.filter(order => order.paymentMethod === 'cash').length,
        card: orders.filter(order => order.paymentMethod === 'card').length,
        upi: orders.filter(order => order.paymentMethod === 'upi').length
      }
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 