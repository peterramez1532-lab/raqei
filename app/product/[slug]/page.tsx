import type { Metadata } from "next";
import ProductClient from "./ProductClient";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  sku: string;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category: {
    name: string;
  };
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/api/products-public/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        title: "Product | RAQEI",
        description:
          "Discover RAQEI — modern fashion designed with simplicity, confidence, and style.",
      };
    }

    const product: ProductData = await res.json();

    return {
      title: `${product.name} | RAQEI`,

      description:
        product.description ||
        `Shop ${product.name} from RAQEI. Modern. Simple. Yours.`,

      keywords: [
        product.name,
        "RAQEI",
        "RAQEI Egypt",
        "fashion",
        "streetwear",
        "clothing",
      ],

      openGraph: {
        title: `${product.name} | RAQEI`,

        description:
          product.description ||
          `Shop ${product.name} from RAQEI.`,

        type: "website",

        siteName: "RAQEI",

        images:
          product.images && product.images.length > 0
            ? [
                {
                  url: product.images[0],
                  alt: product.name,
                },
              ]
            : undefined,
      },

      twitter: {
        card: "summary_large_image",

        title: `${product.name} | RAQEI`,

        description:
          product.description ||
          `Shop ${product.name} from RAQEI.`,
      },
    };
  } catch (error) {
    console.error("PRODUCT SEO ERROR:", error);

    return {
      title: "Product | RAQEI",

      description:
        "Discover RAQEI — modern fashion designed with simplicity, confidence, and style.",
    };
  }
}

export default async function ProductPage({
  params,
}: Props) {
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  let product: ProductData | null = null;

  try {
    const res = await fetch(
      `${baseUrl}/api/products-public/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (res.ok) {
      product = await res.json();
    }
  } catch (error) {
    console.error("PRODUCT SCHEMA ERROR:", error);
  }

  if (!product) {
    return <ProductClient />;
  }

  const productUrl = `${baseUrl}/product/${product.slug}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    description:
      product.description ||
      `Shop ${product.name} from RAQEI.`,

    sku: product.sku,

    url: productUrl,

    image: product.images,

    brand: {
      "@type": "Brand",
      name: "RAQEI",
    },

    category: product.category.name,

    offers: {
      "@type": "Offer",

      url: productUrl,

      priceCurrency: "EGP",

      price: Number(product.price),

      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <ProductClient />
    </>
  );
}