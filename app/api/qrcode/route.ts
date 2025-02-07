import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ auth, version: 'v4' });

        const spreadsheetId = process.env.SHEET_ID;
        const sheetName = 'Analytics';

        if (!spreadsheetId) throw new Error('Spreadsheet ID is not defined');

        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: 'America/Los_Angeles',
        });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:B`,
        });

        const rows = response.data.values || [];
        let dateRowIndex = -1;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === currentDate) {
                dateRowIndex = i + 2;
                break;
            }
        }

        if (dateRowIndex !== -1) {
            const currentCount = parseInt(rows[dateRowIndex - 2][1], 10) || 0;
            const newCount = currentCount + 1;

            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!B${dateRowIndex}`,
                valueInputOption: 'RAW',
                requestBody: { values: [[newCount]] },
            });
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A2:B`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [[currentDate, 1]] },
            });
        }
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error updating Google Sheet:', error);

        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }

}
