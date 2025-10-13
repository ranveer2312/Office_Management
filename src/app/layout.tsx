
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import { useEffect } from "react";
// import "./globals.css";
// import DisableInspect from "../DisableInspect"; // ✅ Import it

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "HRepo",
//   description: "Created by Ranveer and Team ",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   useEffect(() => {
//     // Example watermark text: could be user info from auth system
//     const watermarkText = `Confidential - User: Rana - ${new Date().toLocaleString()}`;
//     document.body.setAttribute("data-watermark", watermarkText);
//   }, []);

//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         <DisableInspect /> {/* ✅ Disable right-click, DevTools */}
//         {children}
//       </body>
//     </html>
//   );
// }


// src/app/layout.tsx (Pure Server Component)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

// ❌ REMOVED: import DisableInspect from "./DisableInspect"; (It must be in the client component)

// ✅ Import the Client Wrapper
import ClientWrapper from "./components/ClientWrapper"; 


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ This metadata export is now valid!
export const metadata: Metadata = {
  title: "HRepo",
  description: "Created by Ranveer and Team ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Pass children to the wrapper, which will handle all client-side logic */}
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}