import type { Metadata } from "next";
import {
  // Roboto,
  // Open_Sans,
  // Montserrat,
  // Poppins,
  // Lato,
  Inter,
  // Roboto_Condensed,
  // Roboto_Mono,
  // Oswald,
  // Noto_Sans,
  // Raleway,
  // Nunito_Sans,
  // Nunito,
} from "next/font/google";

import "./globals.css";

// const roboto = Roboto({ weight: "400", subsets: ["latin"] });
// const openSans = Open_Sans({ subsets: ["latin"] });
// const montserrat = Montserrat({ subsets: ["latin"] });
// const poppins = Poppins({ weight: "400", subsets: ["latin"] });
// const lato = Lato({ weight: "400", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });
// const robotoCondensed = Roboto_Condensed({ subsets: ["latin"] });
// const robotoMono = Roboto_Mono({ subsets: ["latin"] });
// const oswald = Oswald({ subsets: ["latin"] });
// const notoSans = Noto_Sans({ subsets: ["latin"] });
// const raleway = Raleway({ subsets: ["latin"] });
// const nunitoSans = Nunito_Sans({ subsets: ["latin"] });
// const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Color Contrast Checker for WCAG & APCA",
  description:
    "Calculate the contrast ratio of text and background colors to test against WCAG and APCA accessbility standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
