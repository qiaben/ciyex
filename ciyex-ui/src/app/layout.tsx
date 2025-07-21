// app/layout.tsx

import './globals.css' // (adjust path as needed)

export const metadata = {
    title: 'Ciyex',
    description: 'A healthcare platform for doctors and patients',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}
