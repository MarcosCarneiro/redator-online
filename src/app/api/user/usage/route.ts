import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userRepository } from '@/db/repositories/user.repository';

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await userRepository.getById(session.user.id);

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            essaysUsed: dbUser.essaysUsed || 0,
            essayLimit: dbUser.plan?.essayLimit || 3,
            planName: dbUser.plan?.name || 'Grátis'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
