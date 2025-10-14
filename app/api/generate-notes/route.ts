// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import { AssemblyAI } from "assemblyai";

// export async function POST(req: Request) {
//   try {
//     const { videoUrl } = await req.json();

//     if (!videoUrl) {
//       return NextResponse.json(
//         { error: "Video URL is required" },
//         { status: 400 }
//       );
//     }

//     // Step 1: Transcribe video using AssemblyAI
//     const assemblyClient = new AssemblyAI({
//       apiKey: process.env.ASSEMBLYAI_API_KEY!
//     });

//     console.log("Starting transcription...");
//     const transcript = await assemblyClient.transcripts.transcribe({
//       audio: videoUrl,
//       speech_model: "universal",
//     });

//     if (transcript.status === 'error') {
//       throw new Error('Transcription failed: ' + transcript.error);
//     }

//     const transcriptText = transcript.text || "No transcript generated.";
//     console.log("Transcription complete!");

//     // Use raw transcript (skip Gemini if API key issues)
//     const notes = transcriptText;

//     // Step 4: Create PDF with better formatting
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage();
//     const { width, height } = page.getSize();
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
//     // Add title
//     const title = "Lecture Notes";
//     const titleSize = 20;
//     page.drawText(title, {
//       x: 50,
//       y: height - 50,
//       size: titleSize,
//       font: boldFont,
//       color: rgb(0, 0, 0),
//     });

//     // Add date
//     const date = new Date().toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//     page.drawText(date, {
//       x: 50,
//       y: height - 80,
//       size: 10,
//       font,
//       color: rgb(0.5, 0.5, 0.5),
//     });

//     // Add notes content with word wrapping
//     const text = notes.length > 0 ? notes : "No notes generated.";
//     const maxWidth = width - 100;
//     const lineHeight = 14;
//     let yPosition = height - 120;
    
//     // Simple word wrapping
//     const words = text.split(' ');
//     let line = '';
    
//     for (const word of words) {
//       const testLine = line + word + ' ';
//       const testWidth = font.widthOfTextAtSize(testLine, 11);
      
//       if (testWidth > maxWidth) {
//         page.drawText(line, {
//           x: 50,
//           y: yPosition,
//           size: 11,
//           font,
//           color: rgb(0, 0, 0),
//         });
//         line = word + ' ';
//         yPosition -= lineHeight;
        
//         // Add new page if needed
//         if (yPosition < 50) {
//           const newPage = pdfDoc.addPage();
//           yPosition = newPage.getHeight() - 50;
//         }
//       } else {
//         line = testLine;
//       }
//     }
    
//     // Draw remaining text
//     if (line.trim()) {
//       page.drawText(line.trim(), {
//         x: 50,
//         y: yPosition,
//         size: 11,
//         font,
//         color: rgb(0, 0, 0),
//       });
//     }

//     const pdfBytes = await pdfDoc.save();

//     // Return PDF as downloadable file
//     return new NextResponse(Buffer.from(pdfBytes), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="lecture-notes-${Date.now()}.pdf"`,
//       },
//     });

//   } catch (error) {
//     console.error("PDF Generation Error:", error.stack);
//     return NextResponse.json(
//       { 
//         error: "Failed to generate PDF", 
//         details: error instanceof Error ? error.message : "Unknown error"
//       },
//       { status: 500 }
//     );
//   }
// }