'use client';

import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X, Minus, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, closeCart, totalItems } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.denomination * item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShoppingCart className="w-6 h-6" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 flex flex-col h-[calc(100vh-120px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-600 mb-6">Add some gift cards to get started!</p>
              <Link href="/marketplace">
                <Button onClick={closeCart} className="rounded-xl bg-slate-900 hover:bg-slate-800">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {items.map(item => (
                  <div
                    key={`${item.productId}-${item.denomination}`}
                    className="bg-white border border-slate-200 rounded-2xl p-4"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={item.brandName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">{item.brandName}</h4>
                          <button
                            onClick={() => removeItem(item.productId, item.denomination)}
                            className="text-slate-400 hover:text-slate-600 shrink-0"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {item.currency} {item.denomination}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.productId, item.denomination, item.quantity - 1)
                              }
                              className="h-8 w-8 p-0 rounded-lg"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.productId, item.denomination, item.quantity + 1)
                              }
                              className="h-8 w-8 p-0 rounded-lg"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <p className="font-semibold text-slate-900">
                            {item.currency} {(item.denomination * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      50% of profits go to charity. You'll earn Impact Credits to vote on distributions!
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-slate-900">Subtotal</span>
                  <span className="text-xl font-bold text-slate-900">
                    USD {subtotal.toFixed(2)}
                  </span>
                </div>

                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-base font-medium">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
