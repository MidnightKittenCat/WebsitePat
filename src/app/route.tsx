// Import necessary modules and components
import { cookies } from "next/headers";
import { createClient } from "@vercel/kv";
import { NextResponse } from "next/server";

// Import cute images
import headpatImage from '../public/headpat.gif';
import poutImage from '../public/pout.gif';

export async function GET() {
  // Retrieve cookie and create KV client
  const cookieStore = cookies();
  const lastHeadpat = cookieStore.get("headpat");
  const counter = createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  // Initialize variables
  let didTheDeed = false;
  let current = (await counter.get<number>("headpats")) ?? 0;

  // Check if headpat has been done in the last 24 hours
  if (
    !lastHeadpat ||
    new Date(lastHeadpat.value).getTime() >
      new Date().getTime() - 1000 * 60 * 60 * 24
  ) {
    // Perform headpat and update counter
    cookieStore.set("headpat", new Date().getTime().toString(), {
      httpOnly: true,
      expires: new Date().getTime() + 1000 * 60 * 60 * 24,
      secure: true,
    });
    current++;
    didTheDeed = true;
    await counter.set("headpats", current);
  }

  // Define a function to get the appropriate ordinal suffix
  const getOrdinalSuffix = (number: number) => {
    if (number % 100 >= 11 && number % 100 <= 13) {
      return "th";
    }
    switch (number % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // Define styles as a template string
  const styles = `
    body {
      margin: 0;
      overflow: hidden;
      font-family: 'Comic Sans MS', cursive, sans-serif; /* Use a cute font */
      background-color: #1a1a1a; /* Dark mode background */
    }

    main {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: center / cover no-repeat url('${didTheDeed ? '/headpat.gif' : '/pout.gif'}');
      opacity: 0; /* Initial opacity for animation */
      animation: fadeIn 1s ease-in-out forwards;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .message-container {
      background: #00000070;
      border-radius: 0.5em;
      padding: 1.5em 2em;
      color: white;
      font-size: 1.25em;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      animation: slideIn 0.5s ease-in-out forwards;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .message {
      margin: 0;
    }

    .patter-badge {
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

  // Return the appropriate response based on whether headpat was performed
  if (!didTheDeed) {
    // Use pout image and add cute styles
    return new NextResponse(
      `<html lang="en">
        <head>
          <title>Midnight's Headpat</title>
          <style>${styles}</style>
        </head>
        <body>
          <main>
            <div class="message-container">
              <div class="message">Hey! <i>hmph</i> That's enough patting for today.</div>
            </div>
          </main>
        </body>
      </html>`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  // Use headpat image and add cute styles
  return new NextResponse(
    `<html lang="en">
      <head>
        <title>Midnight's Headpat</title>
        <style>${styles}</style>
      </head>
      <body>
        <main>
          <div class="message-container">
            <div class="message">You are the ${current}${getOrdinalSuffix(current)}</div>
            <div class="patter-badge">patter</div>
          </div>
        </main>
      </body>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
