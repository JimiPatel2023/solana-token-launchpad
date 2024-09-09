'use server';
import fs from 'fs';
import path from 'path';


export async function createJsonFile(str: string) {
    const response = await fetch("https://api.jsonserve.com/data", {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,gu;q=0.8,en-GB;q=0.7,ja;q=0.6",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "Referer": "https://jsonserve.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": str,
        "method": "POST"
    });

    const data = await response.json();

    return data;
}

export async function writeJsonFile(data: string, file_name:string) {
    const folderPath = path.join(__dirname, '../../public');
    const filePath = path.join(folderPath, `${file_name}.json`);

    // Check if the folder exists, if not, create it
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Write the JSON data to the file
    fs.writeFileSync(filePath, data, 'utf-8');

    return `https://${process.env.VERCEL_URL}/${file_name}.json`

}
