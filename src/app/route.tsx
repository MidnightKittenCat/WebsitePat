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
  `;

  const containerStyles = `
    background: #00000070;
    border-radius: 0.5em;
    padding: 1.5em 2em;
    color: white;
    font-size: 1.25em;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `;

  const resultHtml = didTheDeed
    ? `
      <html dir="ltr" lang="en">
        <head>
          <title>Midnight's Headpat</title>
        </head>
        <body style="${commonStyles}">
          <main style="${mainStyles};background:center / cover no-repeat url('/headpat.gif');">
            <div style="${containerStyles}">
              <div style="margin: 0;">You are the ${current}${current === 1 ? 'st' : current === 2 ? 'nd' : current === 3 ? 'rd' : 'th'}</div>
              <div style="margin-top: 0; margin-bottom: 0; margin-left: auto; margin-right: auto; background: #66d74a87; border-radius: 0.5em; padding: 0.1em 0.5em 0.3em 0.5em; display: inline-block;">patter</div>
            </div>
          </main>
        </body>
      </html>
    `
    : `
      <html dir="ltr" lang="en">
        <head>
          <title>Midnight's Headpat</title>
        </head>
        <body style="${commonStyles}">
          <main style="${mainStyles};background:center / cover no-repeat url('/pout.gif');">
            <div style="${containerStyles}">
              <div style="margin: 0;">Hey! <i>hmph</i> That's enough patting for today.</div>
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
