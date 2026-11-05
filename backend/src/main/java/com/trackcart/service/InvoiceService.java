package com.trackcart.service;

import com.trackcart.exception.ResourceNotFoundException;
import com.trackcart.model.Invoice;
import com.trackcart.model.Order;
import com.trackcart.model.OrderItem;
import com.trackcart.repository.InvoiceRepository;
import com.trackcart.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, OrderRepository orderRepository) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
    }

    public String generateInvoiceHtml(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        Invoice invoice = invoiceRepository.findByOrder(order).orElse(null);
        String invoiceNum = invoice != null ? invoice.getInvoiceNumber() : "INV-" + order.getOrderNumber();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm").withZone(ZoneId.systemDefault());
        String formattedDate = dtf.format(order.getCreatedAt());

        StringBuilder itemsRows = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            itemsRows.append(String.format("""
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 16px; font-weight: 500; color: #1e293b;">%s</td>
                    <td style="padding: 12px 16px; color: #64748b; font-family: monospace;">%s</td>
                    <td style="padding: 12px 16px; text-align: center; color: #334155;">%d</td>
                    <td style="padding: 12px 16px; text-align: right; color: #334155;">$%.2f</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #0f172a;">$%.2f</td>
                </tr>
            """, item.getProductName(), item.getSku() != null ? item.getSku() : "SKU-GEN", item.getQuantity(), item.getUnitPrice(), item.getSubtotal()));
        }

        String customerName = order.getCustomer() != null && order.getCustomer().getUser() != null
                ? order.getCustomer().getUser().getFullName() : "Valued Customer";
        String customerEmail = order.getCustomer() != null && order.getCustomer().getUser() != null
                ? order.getCustomer().getUser().getEmail() : "customer@trackcart.io";

        return String.format("""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Tax Invoice - %s</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; background-color: #f8fafc; color: #0f172a; }
                    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); padding: 40px; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 28px; }
                    .brand { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
                    .brand span { color: #059669; }
                    .invoice-meta { text-align: right; }
                    .invoice-title { font-size: 20px; font-weight: 700; color: #334155; margin: 0 0 4px 0; }
                    .invoice-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #059669; }
                    .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
                    .address-box h4 { margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
                    .address-box p { margin: 0 0 4px 0; font-size: 14px; line-height: 1.5; color: #334155; }
                    table { width: 100%%; border-collapse: collapse; margin-bottom: 28px; }
                    th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
                    .totals-container { display: flex; justify-content: flex-end; margin-bottom: 36px; }
                    .totals-box { width: 280px; }
                    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #64748b; }
                    .totals-row.grand-total { border-top: 2px solid #0f172a; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 800; color: #0f172a; }
                    .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
                    @media print {
                        body { background: white; padding: 0; }
                        .invoice-card { border: none; box-shadow: none; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-card">
                    <div class="header">
                        <div>
                            <div class="brand">Track<span>Cart</span></div>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Enterprise Intelligent Logistics Platform</p>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">Tax ID: GSTIN-29AAACT9823Q1Z2</p>
                        </div>
                        <div class="invoice-meta">
                            <div class="invoice-title">INVOICE</div>
                            <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 6px;">#%s</div>
                            <span class="invoice-badge">PAID</span>
                        </div>
                    </div>

                    <div class="address-grid">
                        <div class="address-box">
                            <h4>Billed To</h4>
                            <p style="font-weight: 600; color: #0f172a;">%s</p>
                            <p>%s</p>
                            <p>%s, %s %s</p>
                            <p>Email: %s</p>
                        </div>
                        <div class="address-box" style="text-align: right;">
                            <h4>Order Details</h4>
                            <p><strong>Order Ref:</strong> %s</p>
                            <p><strong>Invoice Date:</strong> %s</p>
                            <p><strong>Payment Method:</strong> %s</p>
                            <p><strong>Status:</strong> %s</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>SKU</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Unit Price</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            %s
                        </tbody>
                    </table>

                    <div class="totals-container">
                        <div class="totals-box">
                            <div class="totals-row">
                                <span>Subtotal</span>
                                <span>$%.2f</span>
                            </div>
                            <div class="totals-row">
                                <span>Shipping & Handling</span>
                                <span>$%.2f</span>
                            </div>
                            <div class="totals-row">
                                <span>Tax (GST 18%%)</span>
                                <span>$%.2f</span>
                            </div>
                            <div class="totals-row grand-total">
                                <span>Total Paid</span>
                                <span>$%.2f</span>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for choosing TrackCart! For questions regarding your shipment, visit trackcart.io/track.</p>
                        <p>This is a computer-generated tax invoice and requires no physical signature.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            invoiceNum,
            invoiceNum,
            customerName,
            order.getShippingAddress(),
            order.getCity(), order.getState(), order.getPostalCode(),
            customerEmail,
            order.getOrderNumber(),
            formattedDate,
            order.getPaymentStatus().name(),
            order.getStatus().name(),
            itemsRows.toString(),
            order.getTotalAmount(),
            order.getShippingFee(),
            order.getTaxAmount(),
            order.getFinalAmount()
        );
    }
}
