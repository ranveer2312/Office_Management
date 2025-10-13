// // src/components/ClientWrapper.tsx
// "use client"; // 👈 CRITICAL: This makes it a Client Component

// import { useEffect } from "react";
// // Assuming DisableInspect is also in the components folder
// import DisableInspect from "./DisableInspect"; 

// export default function ClientWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   useEffect(() => {
//     // Client-side logic for the watermark
//     const watermarkText = `Confidential - User: Rana - ${new Date().toLocaleString()}`;
//     document.body.setAttribute("data-watermark", watermarkText);
//   }, []);

//   return (
//     <>
//       <DisableInspect /> 
//       {children}
//     </>
//   );
// }


// src/app/components/ClientWrapper.tsx
"use client"; // 👈 CRITICAL: This enables hooks and browser APIs

import { useEffect } from "react";
// ✅ Import DisableInspect here, using the correct path to the 'src' root:
import DisableInspect from "../../DisableInspect"; 

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
//   useEffect(() => {
//     // Client-side logic for the watermark
//     const watermarkText = `Confidential - User: Rana - ${new Date().toLocaleString()}`;
//     document.body.setAttribute("data-watermark", watermarkText);
//   }, []);

  return (
    <>
      <DisableInspect /> 
      {children}
    </>
  );
}