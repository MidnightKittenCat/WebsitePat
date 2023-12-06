import Image from 'next/image';
import { cookies } from 'next/headers';
import { createClient } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const lastHeadpat = cookieStore.get('headpat');
  const counter = createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  let didTheDeed = false;
  let current = (await counter.get<number>('headpats')) ?? 0;

  if (!lastHeadpat || new Date(lastHeadpat.value).getTime() > new Date().getTime() - 1000 * 60 * 60 * 24) {
    cookieStore.set('headpat', new Date().getTime().toString(), {
      httpOnly: true,
      expires: new Date().getTime() + 1000 * 60 * 60 * 24,
      secure: true,
    });

    current++;
    didTheDeed = true;
    await counter.set('headpats', current);
  }

  const commonStyles = `
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;

  const mainStyles = `
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
  `;

  const containerStyles = `
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 32px;
    text-align: center;
  `;

  const imageStyles = `
    border-radius: 50%;
    margin-bottom: 16px;
  `;

  const resultHtml = didTheDeed
    ? `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Midnight's Headpat</title>
        </head>
        <body style="${commonStyles}">
          <main style="${mainStyles}">
            <div style="${containerStyles}">
              <img src="/headpat.gif" alt="Headpat Image" width="100" height="100" style="${imageStyles}">
              <div style="font-size: 1.5em; color: #333;">You are the ${current}${current === 1 ? 'st' : current === 2 ? 'nd' : current === 3 ? 'rd' : 'th'} patter!</div>
            </div>
          </main>
        </body>
      </html>
    `
    : `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Midnight's Headpat</title>
        </head>
        <body style="${commonStyles}">
          <main style="${mainStyles}">
            <div style="${containerStyles}">
              <img src="/pout.gif" alt="Pout Image" width="100" height="100" style="${imageStyles}">
              <div style="font-size: 1.5em; color: #333;">Hey! <i>hmph</i> That's enough patting for today.</div>
            </div>
          </main>
        </body>
      </html>
    `;

  return new NextResponse(resultHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
