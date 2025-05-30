import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthStateInitializer from "@/components/auth/AuthStateInitializer"; // Corrected path
import AuthStatus from "@/components/auth/AuthStatus"; // Corrected path
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yehudit-the-Midwife",
  description: "A comprehensive guide and support platform for expecting mothers, focusing on pregnancy, childbirth, and early parenthood.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <AuthStateInitializer /> {/* Initialize auth state listener globally */}
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700">
              MyApp
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/articles" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                All Articles
              </Link>
              <Link href="/pregnancy-by-week/1" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Pregnancy by Week
              </Link>
              {/* UserProfileForm link can be added here or kept on main page if preferred */}
              {/* <Link href="/user-profile" className="text-sm font-medium text-gray-700 hover:text-indigo-600"> User Profile</Link> */}
              <AuthStatus /> {/* Display auth status and login/logout/register buttons */}
            </div>
          </nav>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-180px)]"> {/* Adjust min-height based on header/footer */}
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-200 mt-auto">
          © {new Date().getFullYear()} Yehudit&#39;s App. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
