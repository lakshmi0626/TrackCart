package com.trackcart.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "invoice_date")
    private Instant invoiceDate = Instant.now();

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(nullable = false, length = 30)
    private String status = "GENERATED";

    public Invoice() {}

    public Invoice(String invoiceNumber, Order order, BigDecimal totalAmount, BigDecimal taxAmount, String pdfUrl) {
        this.invoiceNumber = invoiceNumber;
        this.order = order;
        this.totalAmount = totalAmount;
        this.taxAmount = taxAmount;
        this.pdfUrl = pdfUrl;
        this.status = "GENERATED";
        this.invoiceDate = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getFormattedInvoiceDate() {
        return this.invoiceDate != null ? this.invoiceDate.toString().substring(0, 10) : "";
    }

    public Instant getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(Instant invoiceDate) { this.invoiceDate = invoiceDate; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
