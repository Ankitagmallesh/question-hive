import { NextResponse } from 'next/server';
import { getProfileByEmail } from '../../server/db/queries/profile';
import { updateProfileAction } from '../../server/actions/profile';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const result = await getProfileByEmail(email);

        return NextResponse.json({ 
            success: true, 
            ...result
        });

    } catch (error: unknown) {
        console.error('Get Profile Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    } catch (error: unknown) {
        console.error('Get Profile Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const result = await updateProfileAction(body);
        
        if (!result.success) {
             throw new Error(result.error);
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully' });

    } catch (error: unknown) {
         console.error('Update Profile Error:', error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
