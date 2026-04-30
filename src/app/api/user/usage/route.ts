import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userRepository } from '@/db/repositories/user.repository';
import { planRepository } from '@/db/repositories/plan.repository';

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

        let essayLimit = dbUser.plan?.essayLimit;
        
        if (!essayLimit) {
            const freePlan = await planRepository.getById('free');
            essayLimit = freePlan?.essayLimit || 3;
        }

        return NextResponse.json({
            essaysUsed: dbUser.essaysUsed || 0,
            essayLimit: essayLimit,
            planName: dbUser.plan?.name || 'Grátis'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
