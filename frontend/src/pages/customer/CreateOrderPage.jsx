import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Package, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

const CATALOG_ITEMS = [
  { id: '1', name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', sku: 'SNY-WH-XM5', price: 349.99, image: '🎧' },
  { id: '2', name: 'Apple iPad Air 11-inch M2 (128GB, Space Gray)', sku: 'APL-IPD-M2', price: 599.00, image: '📱' },
  { id: '3', name: 'Logitech MX Master 3S Performance Wireless Mouse', sku: 'LOG-MX-3S', price: 99.99, image: '🖱️' },
  { id: '4', name: 'Keychron Q1 Pro Custom Mechanical Keyboard (QMK/VIA)', sku: 'KCR-Q1-PRO', price: 199.00, image: '⌨️' },
  { id: '5', name: 'Anker Prime 100W GaN Fast Wall Charger (3-Port)', sku: 'ANK-100W-PRM', price: 59.99, image: '🔌' },
  { id: '6', name: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)', sku: 'DEL-U2723QE', price: 489.99, image: '🖥️' },
];

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([
    { ...CATALOG_ITEMS[0], quantity: 1 },
    { ...CATALOG_ITEMS[4], quantity: 1 },
  ]);

  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace, Suite 100');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [postalCode, setPostalCode] = useState('94105');
  const [deliveryNotes, setDeliveryNotes] = useState('Please leave near apartment entrance if unavailable.');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 100 ? 0 : 12;
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + shippingFee + tax;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Please add at least one item to your order.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        items: cart.map((item) => ({
          productName: item.name,
          sku: item.sku,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        city,
        state,
        postalCode,
        deliveryNotes,
        paymentMethod,
      };

      const created = await api.orders.create(payload);
      navigate(`/track?id=${created.trackingNumber || created.orderNumber}`);
    } catch (err) {
      setError(err.message || 'Failed to place order');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Checkout</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Create New Order
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select items, confirm logistics destination, and dispatch intelligent tracking.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Catalog & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Catalog Selection */}
          <div className="card-subtle p-6 bg-white space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Logistics Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATALOG_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{item.sku}</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                    title="Add item"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Cart */}
          <div className="card-subtle p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Items ({cart.length})</h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  Clear all
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Cart is empty. Add products from the catalog above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.image}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-white rounded-l text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold font-mono text-slate-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-white rounded-r text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-900 w-16 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Shipping Destination & Checkout */}
        <div className="space-y-6">
          <form onSubmit={handleCheckout} className="card-subtle p-6 bg-white space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Destination Address
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Postal</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Courier Delivery Instructions</label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="CREDIT_CARD">Credit / Debit Card (Instant)</option>
                <option value="UPI">UPI / Digital Wallet</option>
                <option value="NET_BANKING">Net Banking Wire</option>
                <option value="COD">Cash On Delivery</option>
              </select>
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Logistics Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (GST 18%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {submitting ? 'Authorizing & Creating Shipment...' : 'Confirm & Dispatch Order'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
