// Supabase Edge Function: Generate Point PDF
// This function generates a simple PDF with "Hello World" using pdf-lib for Deno compatibility.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  PDFDocument,
  PDFPage,
  rgb,
  StandardFonts,
} from "https://esm.sh/pdf-lib@1.17.1";
import { corsHeaders } from "@cors";
import QRCode from "qrcode";

const LOGO_URL = "https://outlawraspberry.de/Outlawraspberry_Logo_v4.png";

async function fetchImageAsUint8Array(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  const buffer = new Uint8Array(await res.arrayBuffer());
  return buffer;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const pageSize = page.getSize();

    page.drawText("You can create PDFs!");

    drawQRCode({
      doc: pdfDoc,
      page,
      pageSize,
      url: "https://congressquest.outlawraspberry.de",
    });

    const logoBytes = await fetchImageAsUint8Array(LOGO_URL);

    // Embed logo image (overlay on QR code)
    const logoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImage, {
      x: 175,
      y: 275,
      width: 50,
      height: 50,
    });

    const pdfBytes = await pdfDoc.save();

    const base64 = btoa(String.fromCharCode(...pdfBytes));

    // Return the PDF as a response
    return new Response(base64, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/text",
      },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function drawQRCode({
  page,
  doc,
  url,
  pageSize,
}: {
  pageSize: { width: number; height: number };
  url: string;
  page: PDFPage;
  doc: PDFDocument;
}): Promise<void> {
  const qrCodeSize = pageSize.width * .66666;
  const qrCodeSizeHalf = qrCodeSize / 2;

  const qrDataUrl = await QRCode.toDataURL(
    url,
    {
      errorCorrectionLevel: "H",
      width: qrCodeSize,
      margin: 2,
      color: { dark: "#000", light: "#FFF" },
    },
  );

  const qrImageBytes = Uint8Array.from(
    atob(qrDataUrl.split(",")[1]),
    (c) => c.charCodeAt(0),
  );

  const qrImage = await doc.embedPng(qrImageBytes);
  page.drawImage(qrImage, {
    x: pageSize.width / 2 - qrCodeSizeHalf,
    y: pageSize.height / 2 - qrCodeSizeHalf,
    width: qrCodeSize,
    height: qrCodeSize,
  });
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-mapping-pdf' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
