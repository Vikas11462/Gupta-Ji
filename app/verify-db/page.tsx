import { supabase } from '@/lib/supabase';

export default async function VerifyDbPage() {
    const { data, error } = await supabase.from('products').select('*').limit(1);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Database Verification</h1>
            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <h2 className="font-semibold">Connection Status</h2>
                    {error ? (
                        <p className="text-red-500">Error: {error.message}</p>
                    ) : (
                        <p className="text-green-500">Connected Successfully</p>
                    )}
                </div>
                <div className="p-4 border rounded bg-gray-50">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
