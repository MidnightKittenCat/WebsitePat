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
    overflow: hidden;
    font-family: system-ui, sans-serif, serif;
  `;

  const mainStyles = `
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
  `;

  const containerStyles = `
    background: rgba(0, 0, 0, 0.7);
    border-radius: 0.5em;
    padding: 1.5em 2em;
    color: white;
    font-size: 1.25em;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  const patterStyles = `
    margin-top: 0;
    margin-bottom: 0;
    background: #66d74a87;
    border-radius: 0.5em;
    padding: 0.1em 0.5em 0.3em 0.5em;
    display: inline-block;
  `;

  const resultHtml = didTheDeed
    ? `
      <html dir="ltr" lang="en">
        <head>
          <title>Midnight's Headpat</title>
          <style>
            ${commonStyles}
            ${mainStyles}
            body {
              background: url('/headpat.gif');
            }
            ${containerStyles}
            ${patterStyles}
          </style>
        </head>
        <body>
          <div>
            You are the ${current}${current === 1 ? 'st' : current === 2 ? 'nd' : current === 3 ? 'rd' : 'th'}
          </div>
          <div style="${patterStyles}">patter</div>
        </body>
      </html>
    `
    : `
      <html dir="ltr" lang="en">
        <head>
          <title>Midnight's Headpat</title>
          <style>
            ${commonStyles}
            ${mainStyles}
            body {
              background: url('/pout.gif');
            }
            ${containerStyles}
          </style>
        </head>
        <body>
          <div>
            Hey! <i>hmph</i> That's enough patting for today.
          </div>
        </body>
      </html>
    `;

  return new NextResponse(resultHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
