import { NextResponse } from 'next/server';
import { google, sheets_v4 } from 'googleapis';
import nodemailer from 'nodemailer';

export async function GET() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
            },
            scopes: [
                "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"
            ]
        })

        const sheets = google.sheets({
            auth, version: 'v4',
        })
        const spreadsheetId = process.env.SHEET_ID;
        const sheetName = 'Orders';

        if (!spreadsheetId) throw new Error('Spreadsheet ID is not defined');

        // Fetch payment status and confirmation email columns (assuming columns: A = email, B = name, C = isPaid, D = isConfirmationEmailSent)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:J`,
        });

        const rows = response.data.values || [];
        const emailsToNotify: { email: string; name: string; cheeseRoll: string; potatoBall: string; guavaStrudel: string; chickenEmpanada: string; rowIndex: number }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const [name, email, , cheeseRoll, potatoBall, guavaStrudel, chickenEmpanada, , isConfirmationEmailSent, paymentStatus] = rows[i];

            if (paymentStatus === 'paid' && isConfirmationEmailSent !== 'true') {
                emailsToNotify.push({ email, name, cheeseRoll, potatoBall, guavaStrudel, chickenEmpanada, rowIndex: i + 2 }); // Data starts from row 2
            }
        }

        if (emailsToNotify.length > 0) {
            await sendEmails(emailsToNotify, sheets, spreadsheetId, sheetName);
        }

        return NextResponse.json({ success: true, message: 'Check completed' });
    } catch (error: unknown) {
        console.error('Error checking Google Sheet:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

async function sendEmails(users: {
    email: string; name: string, cheeseRoll: string;
    potatoBall: string;
    guavaStrudel: string;
    chickenEmpanada: string;
    rowIndex: number;
}[], sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string,) {
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: Number(MAIL_PORT),
        secure: true,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        },
    });

    const transporterVerified = await transporter.verify()
    if (!transporterVerified) {
        return NextResponse.json({
            message: 'Fail to verify transporter'
        }, { status: 500 })
    }


    for (const user of users) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '2025 ASDA Philanthropy Fundraiser: Payment Confirmed!',
            text: `Hello ${user.name},\n\n
            Thank you for your order! Your payment has been confirmed.\n\n
            Order Details:\n
            - ${user.cheeseRoll || `- Cheese Roll(s): ${user.cheeseRoll}`}\n
            - ${user.potatoBall || `- Potato Ball(s): ${user.potatoBall}`}\n
            - ${user.chickenEmpanada || `- Chicken Empanadas(s): ${user.chickenEmpanada}`}\n
            - ${user.guavaStrudel || `- Guava & Cheese Strudel(s): ${user.guavaStrudel}`}\n\n
            Event Info:\n
            When: Monday, March 3rd, 2025 at Lunch\n
            Where: In the Courtyard\n\n

            We are excited to see you soon!\n\n
          
            Best regards,\n
            UCLA ASDA Philanthropy.`,
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch {
            return NextResponse.json({
                message: 'Failed to send one or more emails'
            }, { status: 500 })
        }

        await updateSheet(sheets, spreadsheetId, sheetName, user.rowIndex);
    }
}

async function updateSheet(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string,
    rowIndex: number
) {

    const range = `${sheetName}!I${rowIndex}`;
    const values = [['true']];
    try {

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            requestBody: { values },
        });
        return NextResponse.json({ success: true, message: 'Email Sent. Sheet Updated.' });
    } catch (error: unknown) {
        console.error('Error checking Google Sheet:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
