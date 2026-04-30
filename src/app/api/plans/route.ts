import { NextResponse } from 'next/server';
import { planRepository } from '@/db/repositories/plan.repository';

export async function GET() {
    try {
        const plans = await planRepository.getAll();
        return NextResponse.json(plans);
    } catch (error) {
        console.error('Failed to fetch plans:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
