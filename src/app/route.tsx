import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const lastHeadpat = cookieStore.get("headpat");
  const counter = createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  let didTheDeed = false;

  let current = (await counter.get<number>("headpats")) ?? 0;
  const isWithin24Hours =
    !lastHeadpat ||
    new Date(lastHeadpat.value).getTime() > new Date().getTime() - 1000 * 60 * 60 * 24;

  if (isWithin24Hours) {
    cookieStore.set("headpat", new Date().getTime().toString(), {
      httpOnly: true,
      expires: new Date().getTime() + 1000 * 60 * 60 * 24,
      secure: true,
    });

    current++;
    didTheDeed = true;
    await counter.set("headpats", current);
  }

  const commonStyles = `
    margin: 0;
    overflow: hidden;
    font-family: system-ui, sans-serif, serif;
  `;

  if (!didTheDeed) {
    return new NextResponse(
      `
      <html lang="en">
        <head>
          <title>Midnight's Headpat</title>
        </head>
        <body style="${commonStyles}">
          <main style="
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: center / cover no-repeat url('/pout.gif');
          ">
            <div style="
              background: #00000070;
              border-radius: 0.5em;
              padding: 1.5em 2em;
              color: white;
              font-size: 1.25em;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
            ">
              <div style="margin: 0;">Hey! <i>hmph</i> That's enough patting for today.</div>
            </div>
          </main>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    `
    <html lang="en">
      <head>
        <title>Midnight's Headpat</title>
      </head>
      <body style="${commonStyles}">
        <main style="
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: center / cover no-repeat url('/headpat.gif');
        ">
          <div style="
            background: #00000070;
            border-radius: 0.5em;
            padding: 1.5em 2em;
            color: white;
            font-size: 1.25em;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          ">
            <div style="margin: 0;">
              You are the ${current}${getOrdinalSuffix(current)}
            </div>
            <div style="
              margin-top: 0;
              margin-bottom: 0;
              margin-left: auto;
              margin-right: auto;
              background: #66d74a87;
              border-radius: 0.5em;
              padding: 0.1em 0.5em 0.3em 0.5em;
              display: inline-block;
            ">
              patter
            </div>
          </div>
        </main>
      </body>
    </html>
    `,
    { headers: { "Content-Type": "text/html" } }
  );
}

function getOrdinalSuffix(number: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = number % 100;
  return suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
}
