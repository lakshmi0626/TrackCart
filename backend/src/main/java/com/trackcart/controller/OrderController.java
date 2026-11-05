package com.trackcart.controller;

import com.trackcart.dto.CreateOrderRequest;
import com.trackcart.dto.OrderResponse;
import com.trackcart.service.InvoiceService;
import com.trackcart.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order creation, order lifecycle, cancellation, and invoices")
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    public OrderController(OrderService orderService, InvoiceService invoiceService) {
        this.orderService = orderService;
        this.invoiceService = invoiceService;
    }

    @PostMapping
    @Operation(summary = "Create a new order with automated shipment and invoice generation")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping
    @Operation(summary = "Get list of orders according to authenticated user role")
    public ResponseEntity<List<OrderResponse>> getOrders() {
        return ResponseEntity.ok(orderService.getOrdersForCurrentUser());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by order ID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an eligible order (only before dispatched)")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Customer requested cancellation";
        return ResponseEntity.ok(orderService.cancelOrder(id, reason));
    }

    @GetMapping("/{id}/invoice")
    @Operation(summary = "Download printable tax invoice for an order")
    public ResponseEntity<String> getInvoice(@PathVariable Long id) {
        String html = invoiceService.generateInvoiceHtml(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        headers.add("Content-Disposition", "inline; filename=\"invoice-order-" + id + ".html\"");
        return ResponseEntity.ok().headers(headers).body(html);
    }
}
