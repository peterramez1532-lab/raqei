import type { Metadata } from "next";

import Script from "next/script";

import "./globals.css";


import Navbar from "@/components/Navbar";

import { CartProvider } from "@/components/Providers/CartProvider";


export const metadata: Metadata = {
  title: {
    default: "RAQEI | Modern. Simple. Yours.",
    template: "%s | RAQEI",
  },

  description:
    "Discover RAQEI — modern fashion designed with simplicity, confidence, and style.",

  keywords: [
    "RAQEI",
    "RAQEI Egypt",
    "fashion",
    "streetwear",
    "clothing",
    "Egyptian fashion",
  ],

  authors: [{ name: "RAQEI" }],
  creator: "RAQEI",
  publisher: "RAQEI",

  openGraph: {
    title: "RAQEI | Modern. Simple. Yours.",
    description:
      "Discover RAQEI — modern fashion designed with simplicity, confidence, and style.",
    type: "website",
    siteName: "RAQEI",
  },

  twitter: {
    card: "summary_large_image",
    title: "RAQEI | Modern. Simple. Yours.",
    description:
      "Discover RAQEI — modern fashion designed with simplicity, confidence, and style.",
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="en">

      <body>

        {/* ========================= */}

        {/* META PIXEL */}

        {/* ========================= */}


        <Script

          id="meta-pixel"

          strategy="afterInteractive"

        >

          {`

            !function(f,b,e,v,n,t,s)

            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?

            n.callMethod.apply(n,arguments):n.queue.push(arguments)};

            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';

            n.queue=[];t=b.createElement(e);t.async=!0;

            t.src=v;s=b.getElementsByTagName(e)[0];

            s.parentNode.insertBefore(t,s)}(window, document,'script',

            'https://connect.facebook.net/en_US/fbevents.js');


            fbq('init', '1096666869519212');

            fbq('track', 'PageView');

          `}

        </Script>


        {/* ========================= */}

        {/* GOOGLE ANALYTICS */}

        {/* ========================= */}


        <Script

          src="https://www.googletagmanager.com/gtag/js?id=G-TH7CMVPNY2"

          strategy="afterInteractive"

        />


        <Script

          id="google-analytics"

          strategy="afterInteractive"

        >

          {`

            window.dataLayer = window.dataLayer || [];


            function gtag(){

              dataLayer.push(arguments);

            }


            gtag('js', new Date());


            gtag('config', 'G-TH7CMVPNY2');

          `}

        </Script>


        {/* ========================= */}

        {/* TIKTOK PIXEL */}

        {/* ========================= */}


        <Script

          id="tiktok-pixel"

          strategy="afterInteractive"

        >

          {`

            !function (w, d, t) {

              w.TiktokAnalyticsObject=t;


              var ttq=w[t]=w[t]||[];


              ttq.methods=[

                "page",

                "track",

                "identify",

                "instances",

                "debug",

                "on",

                "off",

                "once",

                "ready",

                "alias",

                "group",

                "enableCookie",

                "disableCookie",

                "holdConsent",

                "revokeConsent",

                "grantConsent"

              ];


              ttq.setAndDefer=function(t,e){

                t[e]=function(){

                  t.push(

                    [e].concat(

                      Array.prototype.slice.call(

                        arguments

                      )

                    )

                  )

                }

              };


              for(

                var i=0;

                i<ttq.methods.length;

                i++

              ){

                ttq.setAndDefer(

                  ttq,

                  ttq.methods[i]

                )

              }


              ttq.instance=function(t){

                for(

                  var e=ttq._i[t]||[],

                  n=0;

                  n<ttq.methods.length;

                  n++

                ){

                  ttq.setAndDefer(

                    e,

                    ttq.methods[n]

                  )

                }


                return e

              };


              ttq.load=function(e,n){

                var r="https://analytics.tiktok.com/i18n/pixel/events.js",

                o=n&&n.partner;


                ttq._i=ttq._i||{};

                ttq._i[e]=[];

                ttq._i[e]._u=r;

                ttq._t=ttq._t||{};

                ttq._t[e]=+new Date;

                ttq._o=ttq._o||{};

                ttq._o[e]=n||{};


                n=document.createElement("script");

                n.type="text/javascript";

                n.async=!0;

                n.src=r+"?sdkid="+e+"&lib="+t;


                e=document.getElementsByTagName("script")[0];

                e.parentNode.insertBefore(n,e);

              };


              ttq.load('DAJAHP3C77U2FG645GFG');

              ttq.page();


            }(window, document, 'ttq');

          `}

        </Script>


        {/* ========================= */}

        {/* RAQEI APP */}

        {/* ========================= */}


        <CartProvider>

          <Navbar />

          {children}

        </CartProvider>

      </body>

    </html>

  );

}