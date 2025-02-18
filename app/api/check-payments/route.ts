import { google, sheets_v4 } from 'googleapis';
import { NextResponse } from 'next/server';
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
        });

        const sheets = google.sheets({ auth, version: 'v4' });
        const spreadsheetId = process.env.SHEET_ID;
        const sheetName = 'Orders';

        if (!spreadsheetId) throw new Error('Spreadsheet ID is not defined');

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:K`,
        });

        const rows = response.data.values || [];
        const emailsToNotify: { email: string; name: string; cheeseRoll: string; potatoBall: string; guavaStrudel: string; chickenEmpanada: string; orderId: string; rowIndex: number }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const [name, email, , cheeseRoll, potatoBall, guavaStrudel, chickenEmpanada, , isConfirmationEmailSent, paymentStatus, orderId] = rows[i];
            if (paymentStatus === 'paid' && (isConfirmationEmailSent as string).toLowerCase() !== 'true') {
                emailsToNotify.push({
                    email,
                    name,
                    cheeseRoll: cheeseRoll || '0',
                    potatoBall: potatoBall || '0',
                    guavaStrudel: guavaStrudel || '0',
                    chickenEmpanada: chickenEmpanada || '0',
                    orderId,
                    rowIndex: i + 2
                });
            }
        }

        if (emailsToNotify.length > 0) {
            await sendEmails(emailsToNotify, sheets, spreadsheetId, sheetName);
            console.log("Emails sent and sheet updated");
            return NextResponse.json({ success: true, message: 'Emails sent and sheet updated successfully' });
        } else {
            return NextResponse.json({ success: true, message: 'No emails to send' });
        }

    } catch (error: unknown) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

async function sendEmails(
    users: { email: string; name: string; cheeseRoll: string; potatoBall: string; guavaStrudel: string; chickenEmpanada: string; orderId: string; rowIndex: number }[],
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string
) {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
    });

    try {
        await transporter.verify();
    } catch (error) {
        console.error('Failed to verify transporter:', error);
        throw new Error('Failed to verify email transporter');
    }

    for (const user of users) {
        try {
            const mailOptions = {
                from: `No Reply <${process.env.MAIL_USER}>`,
                to: user.email,
                subject: '2025 ASDA Philanthropy Fundraiser: Payment Confirmed!',
                text: `Hello ${user.name},\n\nThank you for your order! Your payment has been confirmed.\n\nOrder Details:\nOrder ID: ${user.orderId}\n\n` +
                    `${user.cheeseRoll !== '0' ? `- Cheese Roll(s): ${user.cheeseRoll}\n` : ''}` +
                    `${user.potatoBall !== '0' ? `- Potato Ball(s): ${user.potatoBall}\n` : ''}` +
                    `${user.chickenEmpanada !== '0' ? `- Chicken Empanada(s): ${user.chickenEmpanada}\n` : ''}` +
                    `${user.guavaStrudel !== '0' ? `- Guava & Cheese Strudel(s): ${user.guavaStrudel}\n` : ''}\n` +
                    `Event Info:\nWhen: Monday, March 3rd, 2025 at Lunch\nWhere: In the Courtyard\n\n` +
                    `We are excited to see you soon!\n\nBest regards,\nUCLA ASDA Philanthropy.`
            };

            await transporter.sendMail(mailOptions);
            await updateSheet(sheets, spreadsheetId, sheetName, user.rowIndex);
            console.log(`Email sent and sheet updated for ${user.email}`);
        } catch (error) {
            console.error(`Failed to process user ${user.email}:`, error);
            throw new Error(`Failed to send email or update sheet for ${user.email}`);
        }
    }
}

async function updateSheet(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string,
    rowIndex: number
) {
    const range = `${sheetName}!I${rowIndex}`;
    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: { values: [['true']] },
        });
    } catch (error) {
        console.error('Error updating sheet:', error);
        throw new Error('Failed to update Google Sheet');
    }
}