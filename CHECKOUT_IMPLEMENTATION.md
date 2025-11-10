# Checkout Flow Implementation

## Overview
Complete checkout flow for purchasing gift cards with integrated charity donations and Impact Credits system.

## Features Implemented

### 1. Shopping Cart System
- **Cart Context**: React Context-based state management with localStorage persistence
- **Cart Drawer**: Slide-out cart UI with item management (add/remove/quantity)
- **Header Integration**: Cart button with live item count badge
- **Features**:
  - Add items from product detail pages
  - Update quantities
  - Remove items
  - Persistent across sessions
  - Real-time subtotal calculation

### 2. Checkout Flow
- **Checkout Page**: `/checkout`
  - Order summary with item details
  - Payment total calculation
  - Impact Credits estimation
  - Charity contribution preview
  - Stripe Checkout integration

### 3. Payment Processing
- **Stripe Integration**:
  - Secure Stripe Checkout Sessions
  - Card payment processing
  - Webhook event handling
  - Transaction tracking
  
- **API Endpoints**:
  - `POST /api/checkout/create-session`: Create Stripe checkout session
  - `POST /api/stripe/webhook`: Handle payment events
  - `POST /api/orders/process`: Process gift card fulfillment

### 4. Success & Failure Pages
- **Success Page**: `/checkout/success`
  - Payment confirmation
  - Order details
  - Impact summary
  - Links to dashboard and marketplace

- **Cancel Page**: `/checkout/cancel`
  - Cancellation notice
  - Cart preservation
  - Retry options

### 5. Gift Card Fulfillment
- **Database Fields**:
  - `gift_card_code`: Stores gift card redemption code
  - `recipient_email`: User email for delivery
  - `fulfillment_status`: Tracking (pending/fulfilled/failed)
  - `fulfilled_at`: Timestamp

- **Processing**:
  - Automatic fulfillment after payment
  - Mock gift card generation (placeholder for Reloadly)
  - Email capture for delivery

### 6. Impact Dashboard Integration
- **Purchase History**:
  - Enhanced card-based UI
  - Gift card code display with copy button
  - Purchase date and amount
  - Charity contribution per purchase
  - PACT Credits earned per purchase

### 7. Profit Split & Credits
- **Automatic Calculation**:
  - 50% company share
  - 50% charity share
  - Impact Credits: 10 credits per $1 to charity
  
- **Credit Tracking**:
  - `user_pact_credits` table
  - Lifetime earned tracking
  - Current balance
  - Auto-update on successful payment

## Database Schema

### New Tables/Fields

#### transactions (enhanced)
```sql
gift_card_code text
recipient_email text
fulfillment_status text DEFAULT 'pending'
fulfilled_at timestamptz
```

#### user_purchases (enhanced)
```sql
gift_card_code text
recipient_email text
```

## Configuration

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_BASE_URL=
```

### Admin Settings (via admin dashboard)
Settings stored in `app_settings` table:
- `stripe_secret_key`: Stripe API secret key
- `stripe_webhook_secret`: Stripe webhook signing secret
- `reloadly_client_id`: Reloadly API client ID
- `reloadly_client_secret`: Reloadly API client secret
- `every_org_api_key`: Every.org API key
- `markup_percentage`: Price markup (default: 5%)
- `profit_split_company`: Company profit % (default: 50%)
- `profit_split_charity`: Charity profit % (default: 50%)
- `impact_tickets_multiplier`: Credits per dollar (default: 10)

## User Flow

1. **Browse** → User views gift cards in marketplace
2. **Select** → User clicks on product to see details
3. **Add to Cart** → Selects denomination and adds to cart
4. **Cart Review** → Opens cart drawer to review items
5. **Checkout** → Clicks "Proceed to Checkout"
6. **Payment** → Redirected to Stripe Checkout
7. **Success** → Payment processed, redirected to success page
8. **Fulfillment** → Gift cards generated and codes displayed
9. **Dashboard** → View purchases and gift card codes in Impact Dashboard

## Webhook Flow

### Payment Success (`checkout.session.completed`)
1. Mark transactions as completed
2. Create `user_purchases` entries
3. Initialize/update `user_pact_credits`
4. Award Impact Credits
5. Update profile stats
6. Trigger gift card fulfillment

### Payment Failure (`checkout.session.expired` or `payment_intent.payment_failed`)
1. Mark transactions as failed
2. No credits awarded
3. No fulfillment triggered

## Security Features

- ✅ Authentication required for checkout
- ✅ User ID validation in API endpoints
- ✅ Stripe webhook signature verification
- ✅ Secure payment processing (PCI compliant via Stripe)
- ✅ Input validation and sanitization
- ✅ Row-level security on database tables
- ✅ Service role key for admin operations

## Mobile Responsive

- ✅ Cart drawer optimized for mobile
- ✅ Checkout page responsive layout
- ✅ Touch-friendly buttons and interactions
- ✅ Horizontal scrolling prevented
- ✅ Proper viewport sizing

## Testing Stripe Integration

### Test Mode
Use Stripe test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication: `4000 0025 0000 3155`

### Webhook Testing
1. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

## TODO / Future Enhancements

### High Priority
- [ ] Email notifications (order confirmation)
- [ ] Complete Reloadly API integration (real gift cards)
- [ ] Charity preference-based profit distribution
- [ ] Direct charity donation flow

### Medium Priority
- [ ] Order history export (CSV/PDF)
- [ ] Gift card code email delivery
- [ ] Refund handling
- [ ] Order search and filtering

### Nice to Have
- [ ] Multiple payment methods
- [ ] Save cart for later
- [ ] Gift option (send to someone else)
- [ ] Order tracking notifications
- [ ] Bulk purchase discounts

## Files Changed/Added

### New Files
- `lib/cart-context.tsx` - Cart state management
- `components/cart-drawer.tsx` - Shopping cart UI
- `app/checkout/page.tsx` - Checkout page
- `app/checkout/success/page.tsx` - Success page
- `app/checkout/cancel/page.tsx` - Cancel page
- `app/api/checkout/create-session/route.ts` - Checkout API
- `app/api/orders/process/route.ts` - Order fulfillment API
- `supabase/migrations/20251110000000_add_gift_card_fulfillment_fields.sql`

### Modified Files
- `app/layout.tsx` - Added CartProvider and CartDrawer
- `components/shared-header.tsx` - Added cart button
- `app/marketplace/[productId]/page.tsx` - Added cart functionality
- `app/api/stripe/webhook/route.ts` - Enhanced webhook handling
- `app/impact/page.tsx` - Enhanced purchase history UI

## Notes

- Current implementation uses mock gift card codes
- Reloadly API integration needs product ID mapping
- Email service integration pending (Resend/SendGrid)
- Every.org donation flow not yet implemented
- All monetary values in USD
