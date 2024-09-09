'use server';

import { headers } from 'next/headers';

interface JsonFileData {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

export async function createJsonFile(data: JsonFileData) {
  const response = await fetch("https://www.npoint.io/documents", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,gu;q=0.8,en-GB;q=0.7,ja;q=0.6",
      "cache-control": "no-cache",
      "content-type": "application/json;charset=UTF-8",
      pragma: "no-cache",
      priority: "u=1, i",
      "sec-ch-ua": headers().get('sec-ch-ua') || '',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": headers().get('sec-ch-ua-platform') || '',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      Referer: "https://www.npoint.io/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: JSON.stringify({
      contents: JSON.stringify(data),
    }),
    method: "POST",
    cache:"no-cache"
  });

  return response.json();
}