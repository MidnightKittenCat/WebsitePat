import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@vercel/kv";
import { NextResponse } from "next/server";

const pageStyles = `
  body {
    margin: 0;
    overflow: hidden;
    font-family: system-ui, sans-serif, serif;
  }

  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: center / cover no-repeat url('/headpat.gif');
  }

  .popup {
    background: #00000070;
    border-radius: 0.5em;
    padding: 1.5em 2em;
    color: white;
    font-size: 1.25em;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .popup-message {
    margin: 0;
  }

  .counter {
    margin: 0;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: auto;
    margin-right: auto;
    background: #66d74a87;
    border-radius: 0.5em;
    padding: 0.1em 0.5em 0.3em 0.5em;
    display: inline-block;
  }
`;

export async function GET() {
  const cookieStore = cookies();
  const lastHeadpat = cookieStore.get("headpat");
  const counter = createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  let didTheDeed = false;
  let current = (await counter.get<number>("headpats")) ?? 0;

  if (
    !lastHeadpat ||
    new Date(lastHeadpat.value).getTime() >
      new Date().getTime() - 1000 * 60 * 60 * 24
  ) {
    cookieStore.set("headpat", new Date().getTime().toString(), {
      httpOnly: true,
      expires: new Date().getTime() + 1000 * 60 * 60 * 24,
      secure: true,
    });
    current++;
    didTheDeed = true;
    await counter.set("headpats", current);
  }

  const counterSuffix =
    current === 1 ? "st" : current === 2 ? "nd" : current === 3 ? "rd" : "th";

  const responseHtml = `
    <html dir="ltr" lang="en">
      <head>
        <title>Midnight's Headpat</title>
        <style>${pageStyles}</style>
      </head>
      <body>
        <main>
          <div class="popup">
            ${didTheDeed ? `
              <div class="popup-message">
                You are the ${current}${counterSuffix}
              </div>
              <div class="counter">patter</div>
            ` : `
              <div class="popup-message">
                Hey! <i>hmph</i> That's enough patting for today.
              </div>
            `}
          </div>
        </main>
      </body>
    </html>
  `;

  return new NextResponse(responseHtml, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
