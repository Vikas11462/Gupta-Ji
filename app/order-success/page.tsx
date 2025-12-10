'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 rounded-full bg-green-100 p-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
            <p className="mb-8 max-w-md text-gray-600">
                Thank you for your order. We have received it and will begin processing it shortly. You will pay via Cash on Delivery when it arrives.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/"
                    className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/profile"
                    className="rounded-md border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
}
