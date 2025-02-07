import { NextResponse } from 'next/server';

export async function middleware(req: Request) {
    const url = new URL(req.url);

    if (url.pathname === '/qrcode') {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/qrcode`, { method: 'POST' });
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/qrcode',
};



