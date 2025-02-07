"use server"
import { google } from 'googleapis'
import { encodeUrl } from './utils'
import { redirect } from 'next/navigation'

const strToNumber = (str: string | undefined) => {
    return str ? +str : 0
}
const sum = (nums: Array<number>) => {
    let total = 0
    nums.forEach(num => total += num)
    return total
}

export const addEntry = async (formData: FormData) => {
    const name = formData.get("name")?.toString()
    const email = formData.get("email")?.toString()
    const phone = formData.get("phone")?.toString()
    const cheeseRoll = strToNumber(formData.get("cheeseRoll")?.toString())
    const potatoBall = strToNumber(formData.get("potatoBall")?.toString())
    const guavaStrudel = strToNumber(formData.get("guavaStrudel")?.toString())
    const chickenEmpanada = strToNumber(formData.get("chickenEmpanada")?.toString())
    let redirectPath: string = ''
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

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Orders!A1:J1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [name, email, phone, cheeseRoll, potatoBall, guavaStrudel, chickenEmpanada, sum([cheeseRoll, potatoBall, guavaStrudel, chickenEmpanada]) * 4, false, 'pending']
                ]
            }
        })
        redirectPath = encodeUrl("/", "success", "Your order has been received! A confirmation email will be sent to you as soon as we verify your payment.")
    } catch (e: unknown) {
        console.error(e)
        redirectPath = encodeUrl("/", "error", "Something went wrong… We couldn't process your order. Please try again later or contact our admin at nguyen.nguyen@nSquare.dev. Thank you for your understanding!")
    } finally {
        redirect(redirectPath)
    }
}