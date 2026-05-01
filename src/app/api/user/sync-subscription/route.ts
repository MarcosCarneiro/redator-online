import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { syncUserSubscription } from '@/lib/sync-subscription';

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const synced = await syncUserSubscription(userId);

        if (synced) {
            return NextResponse.json({ synced: true, status: 'active' });
        } else {
            return NextResponse.json({ synced: true, status: 'none' });
        }

    } catch (error: unknown) {
        console.error('Sync Error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}