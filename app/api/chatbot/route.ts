import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type ProductWithCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: unknown;
  comparePrice: unknown;
  stock: number;
  isFeatured: boolean;
  images: string[];
  createdAt: Date;
  category: {
    name: string;
    slug: string;
  };
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(price: unknown) {
  const number = Number(price);

  if (Number.isNaN(number)) {
    return "";
  }

  return `${number.toLocaleString("en-US")} EGP`;
}

function productText(product: ProductWithCategory) {
  return normalizeText(
    [
      product.name,
      product.description || "",
      product.category.name,
      product.category.slug,
    ].join(" ")
  );
}

function toChatProduct(product: ProductWithCategory) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    comparePrice:
      product.comparePrice !== null
        ? Number(product.comparePrice)
        : null,
    stock: product.stock,
    image: product.images?.[0] || null,
  };
}

function isPriceQuestion(text: string) {
  return (
    text.includes("سعر") ||
    text.includes("بكام") ||
    text.includes("كام") ||
    text.includes("تكلف") ||
    text.includes("price") ||
    text.includes("how much")
  );
}

function isStockQuestion(text: string) {
  return (
    text.includes("متاح") ||
    text.includes("متوفر") ||
    text.includes("موجود") ||
    text.includes("stock") ||
    text.includes("available")
  );
}

function isDiscountQuestion(text: string) {
  return (
    text.includes("خصم") ||
    text.includes("خصومات") ||
    text.includes("عروض") ||
    text.includes("عرض") ||
    text.includes("discount") ||
    text.includes("sale") ||
    text.includes("offer")
  );
}

function isCheapestQuestion(text: string) {
  return (
    text.includes("ارخص") ||
    text.includes("أرخص") ||
    text.includes("اقل سعر") ||
    text.includes("أقل سعر") ||
    text.includes("اقل حاجه") ||
    text.includes("أقل حاجة") ||
    text.includes("cheapest") ||
    text.includes("lowest price")
  );
}

function isMostExpensiveQuestion(text: string) {
  return (
    text.includes("اغلى") ||
    text.includes("أغلى") ||
    text.includes("اعلى سعر") ||
    text.includes("أعلى سعر") ||
    text.includes("most expensive") ||
    text.includes("highest price")
  );
}

function isNewestQuestion(text: string) {
  return (
    text.includes("جديد") ||
    text.includes("جديدة") ||
    text.includes("الجديد") ||
    text.includes("الجديده") ||
    text.includes("أحدث") ||
    text.includes("احدث") ||
    text.includes("new") ||
    text.includes("latest")
  );
}

function isProductListQuestion(text: string) {
  return (
    text.includes("منتجات") ||
    text.includes("منتج") ||
    text.includes("عندكم") ||
    text.includes("وريني") ||
    text.includes("رشح") ||
    text.includes("ابحث") ||
    text.includes("show me") ||
    text.includes("products") ||
    text.includes("recommend")
  );
}

function extractBudget(text: string) {
  const normalized = normalizeText(text);

  const patterns = [
    /(?:تحت|اقل من|أقل من|في حدود|حدود|budget|under|below|max|maximum)\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:جنيه|ج|egp)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (match?.[1]) {
      const value = Number(match[1]);

      if (!Number.isNaN(value) && value > 0) {
        return value;
      }
    }
  }

  return null;
}

function extractPriceRange(text: string) {
  const normalized = normalizeText(text);

  const rangePatterns = [
    /(?:من)\s*(\d+)\s*(?:ل|الى|إلى|-)\s*(\d+)/i,
    /(\d+)\s*(?:ل|الى|إلى|-)\s*(\d+)/i,
  ];

  for (const pattern of rangePatterns) {
    const match = normalized.match(pattern);

    if (match?.[1] && match?.[2]) {
      const min = Number(match[1]);
      const max = Number(match[2]);

      if (
        !Number.isNaN(min) &&
        !Number.isNaN(max) &&
        min >= 0 &&
        max >= min
      ) {
        return {
          min,
          max,
        };
      }
    }
  }

  return null;
}

function findMentionedProduct(
  text: string,
  products: ProductWithCategory[]
) {
  const normalizedQuestion = normalizeText(text);

  let bestProduct: ProductWithCategory | null = null;
  let bestScore = 0;

  for (const product of products) {
    const normalizedName = normalizeText(product.name);

    if (!normalizedName) {
      continue;
    }

    if (normalizedQuestion.includes(normalizedName)) {
      return product;
    }

    const words = normalizedName
      .split(" ")
      .filter((word) => word.length >= 2);

    let score = 0;

    for (const word of words) {
      if (normalizedQuestion.includes(word)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestScore > 0 ? bestProduct : null;
}

function searchProducts(
  question: string,
  products: ProductWithCategory[]
) {
  const normalizedQuestion = normalizeText(question);

  const words = normalizedQuestion
    .split(" ")
    .filter((word) => word.length >= 2)
    .filter(
      (word) =>
        ![
          "ايه",
          "اي",
          "عندكم",
          "عندي",
          "عايز",
          "عاوزه",
          "عاوز",
          "ممكن",
          "وريني",
          "هات",
          "لي",
          "من",
          "في",
          "على",
          "علي",
          "اللي",
          "هو",
          "هي",
          "ده",
          "دي",
          "ده",
          "منتج",
          "منتجات",
          "حاجه",
          "حاجة",
        ].includes(word)
    );

  const scored = products
    .map((product) => {
      const searchableText = productText(product);

      let score = 0;

      for (const word of words) {
        if (searchableText.includes(word)) {
          score++;
        }
      }

      if (product.isFeatured) {
        score += 0.25;
      }

      if (product.stock > 0) {
        score += 0.25;
      }

      return {
        product,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((item) => item.product);
}

function getDiscountedProducts(products: ProductWithCategory[]) {
  return products
    .filter(
      (product) =>
        product.comparePrice !== null &&
        Number(product.comparePrice) > Number(product.price)
    )
    .sort(
      (a, b) =>
        Number(b.comparePrice) -
        Number(b.price) -
        (Number(a.comparePrice) -
          Number(a.price))
    )
    .slice(0, 5);
}

function getAvailableProducts(products: ProductWithCategory[]) {
  return products
    .filter((product) => product.stock > 0)
    .slice(0, 5);
}

function getCheapestProducts(products: ProductWithCategory[]) {
  return [...products]
    .filter((product) => product.stock > 0)
    .sort(
      (a, b) =>
        Number(a.price) -
        Number(b.price)
    )
    .slice(0, 5);
}

function getMostExpensiveProducts(
  products: ProductWithCategory[]
) {
  return [...products]
    .filter((product) => product.stock > 0)
    .sort(
      (a, b) =>
        Number(b.price) -
        Number(a.price)
    )
    .slice(0, 5);
}

function getNewestProducts(
  products: ProductWithCategory[]
) {
  return [...products]
    .filter((product) => product.stock > 0)
    .sort(
      (a, b) =>
        b.createdAt.getTime() -
        a.createdAt.getTime()
    )
    .slice(0, 5);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const question =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        {
          message:
            "اكتبلي سؤالك وأنا هساعدك 😊",
          products: [],
        },
        { status: 400 }
      );
    }

    const products =
      await prisma.product.findMany({
        where: {
          isActive: true,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (products.length === 0) {
      return NextResponse.json({
        message:
          "حاليًا مفيش منتجات متاحة في المتجر. تابعنا قريبًا 🤍",
        products: [],
      });
    }

    const normalizedQuestion =
      normalizeText(question);

    /*
     * ========================================================
     * GREETING
     * ========================================================
     */

    if (
      normalizedQuestion === "اهلا" ||
      normalizedQuestion === "اهلين" ||
      normalizedQuestion === "هاي" ||
      normalizedQuestion === "هلا" ||
      normalizedQuestion === "hello" ||
      normalizedQuestion === "hi"
    ) {
      return NextResponse.json({
        message:
          "أهلًا بيك في RAQEI 🤍\n\nأقدر أساعدك في المنتجات، الأسعار، الخصومات والتوفر.\n\nاسألني براحتك.",
        products: [],
      });
    }

    /*
     * ========================================================
     * SPECIFIC PRODUCT
     * ========================================================
     */

    const mentionedProduct =
      findMentionedProduct(
        question,
        products
      );

    if (mentionedProduct) {
      if (isPriceQuestion(normalizedQuestion)) {
        const hasDiscount =
          mentionedProduct.comparePrice !==
            null &&
          Number(
            mentionedProduct.comparePrice
          ) >
            Number(
              mentionedProduct.price
            );

        return NextResponse.json({
          message: hasDiscount
            ? `سعر ${mentionedProduct.name} حاليًا ${formatPrice(
                mentionedProduct.price
              )} بدل ${formatPrice(
                mentionedProduct.comparePrice
              )} 🔥`
            : `سعر ${mentionedProduct.name} هو ${formatPrice(
                mentionedProduct.price
              )}.`,
          products: [
            toChatProduct(
              mentionedProduct
            ),
          ],
        });
      }

      if (isStockQuestion(normalizedQuestion)) {
        if (mentionedProduct.stock > 0) {
          return NextResponse.json({
            message: `أيوه، ${mentionedProduct.name} متاح حاليًا ✅`,
            products: [
              toChatProduct(
                mentionedProduct
              ),
            ],
          });
        }

        return NextResponse.json({
          message: `للأسف ${mentionedProduct.name} خلص من المخزون حاليًا 😔`,
          products: [
            toChatProduct(
              mentionedProduct
            ),
          ],
        });
      }

      const description =
        mentionedProduct.description?.trim() ||
        "مفيش وصف إضافي للمنتج حاليًا.";

      const availability =
        mentionedProduct.stock > 0
          ? "متاح حاليًا"
          : "غير متاح حاليًا";

      const hasDiscount =
        mentionedProduct.comparePrice !==
          null &&
        Number(
          mentionedProduct.comparePrice
        ) >
          Number(
            mentionedProduct.price
          );

      return NextResponse.json({
        message:
          `أكيد 🤍\n\n` +
          `${mentionedProduct.name}\n` +
          `السعر: ${formatPrice(
            mentionedProduct.price
          )}\n` +
          `${
            hasDiscount
              ? `السعر قبل الخصم: ${formatPrice(
                  mentionedProduct.comparePrice
                )}\n`
              : ""
          }` +
          `التصنيف: ${mentionedProduct.category.name}\n` +
          `الحالة: ${availability}\n\n` +
          `${description}`,
        products: [
          toChatProduct(
            mentionedProduct
          ),
        ],
      });
    }

    /*
     * ========================================================
     * DISCOUNTS
     * ========================================================
     */

    if (isDiscountQuestion(normalizedQuestion)) {
      const discountedProducts =
        getDiscountedProducts(products);

      if (discountedProducts.length === 0) {
        return NextResponse.json({
          message:
            "حاليًا مفيش منتجات عليها خصم، لكن تابعنا لأن العروض بتتحدث باستمرار 🤍",
          products: [],
        });
      }

      return NextResponse.json({
        message:
          "دي المنتجات اللي عليها عروض حاليًا 🔥",
        products:
          discountedProducts.map(
            toChatProduct
          ),
      });
    }

    /*
     * ========================================================
     * CHEAPEST
     * ========================================================
     */

    if (isCheapestQuestion(normalizedQuestion)) {
      const cheapest =
        getCheapestProducts(products);

      if (cheapest.length === 0) {
        return NextResponse.json({
          message:
            "مفيش منتجات متاحة حاليًا 🤍",
          products: [],
        });
      }

      const cheapestProduct =
        cheapest[0];

      return NextResponse.json({
        message:
          `أقل سعر متاح حاليًا هو ${formatPrice(
            cheapestProduct.price
          )} للمنتج ${cheapestProduct.name} 🤍`,
        products: cheapest,
      });
    }

    /*
     * ========================================================
     * MOST EXPENSIVE
     * ========================================================
     */

    if (
      isMostExpensiveQuestion(
        normalizedQuestion
      )
    ) {
      const expensive =
        getMostExpensiveProducts(
          products
        );

      if (expensive.length === 0) {
        return NextResponse.json({
          message:
            "مفيش منتجات متاحة حاليًا 🤍",
          products: [],
        });
      }

      const expensiveProduct =
        expensive[0];

      return NextResponse.json({
        message:
          `أعلى سعر متاح حاليًا هو ${formatPrice(
            expensiveProduct.price
          )} للمنتج ${expensiveProduct.name}.`,
        products: expensive,
      });
    }

    /*
     * ========================================================
     * NEW PRODUCTS
     * ========================================================
     */

    if (
      isNewestQuestion(
        normalizedQuestion
      )
    ) {
      const newest =
        getNewestProducts(products);

      if (newest.length === 0) {
        return NextResponse.json({
          message:
            "مفيش منتجات متاحة حاليًا 🤍",
          products: [],
        });
      }

      return NextResponse.json({
        message:
          "دي أحدث المنتجات المتاحة حاليًا 🤍",
        products: newest,
      });
    }

    /*
     * ========================================================
     * BUDGET
     * ========================================================
     */

    const budget = extractBudget(
      normalizedQuestion
    );

    if (budget !== null) {
      const budgetProducts =
        products
          .filter(
            (product) =>
              product.stock > 0 &&
              Number(product.price) <=
                budget
          )
          .sort(
            (a, b) =>
              Number(a.price) -
              Number(b.price)
          )
          .slice(0, 5);

      if (
        budgetProducts.length === 0
      ) {
        return NextResponse.json({
          message:
            `مش لاقي حاليًا منتج متاح بسعر ${formatPrice(
              budget
            )} أو أقل 😔`,
          products: [],
        });
      }

      return NextResponse.json({
        message:
          `دي المنتجات المتاحة في حدود ${formatPrice(
            budget
          )} أو أقل 🤍`,
        products:
          budgetProducts.map(
            toChatProduct
          ),
      });
    }

    /*
     * ========================================================
     * PRICE RANGE
     * ========================================================
     */

    const priceRange =
      extractPriceRange(
        normalizedQuestion
      );

    if (priceRange) {
      const rangeProducts =
        products
          .filter(
            (product) =>
              product.stock > 0 &&
              Number(product.price) >=
                priceRange.min &&
              Number(product.price) <=
                priceRange.max
          )
          .sort(
            (a, b) =>
              Number(a.price) -
              Number(b.price)
          )
          .slice(0, 5);

      if (
        rangeProducts.length === 0
      ) {
        return NextResponse.json({
          message:
            `مش لاقي منتجات متاحة بين ${formatPrice(
              priceRange.min
            )} و ${formatPrice(
              priceRange.max
            )} حاليًا.`,
          products: [],
        });
      }

      return NextResponse.json({
        message:
          `دي المنتجات المتاحة بين ${formatPrice(
            priceRange.min
          )} و ${formatPrice(
            priceRange.max
          )} 🤍`,
        products:
          rangeProducts.map(
            toChatProduct
          ),
      });
    }

    /*
     * ========================================================
     * AVAILABLE PRODUCTS
     * ========================================================
     */

    if (
      isStockQuestion(
        normalizedQuestion
      ) &&
      isProductListQuestion(
        normalizedQuestion
      )
    ) {
      const available =
        getAvailableProducts(
          products
        );

      return NextResponse.json({
        message:
          "دي المنتجات المتاحة حاليًا 🤍",
        products:
          available.map(
            toChatProduct
          ),
      });
    }

    /*
     * ========================================================
     * PRODUCT SEARCH
     * ========================================================
     */

    if (
      isProductListQuestion(
        normalizedQuestion
      )
    ) {
      const results =
        searchProducts(
          question,
          products
        );

      if (results.length > 0) {
        return NextResponse.json({
          message:
            results.length === 1
              ? "لقيت المنتج ده ليك 🤍"
              : `لقيتلك ${results.length} منتجات ممكن تناسب سؤالك 🤍`,
          products:
            results.map(
              toChatProduct
            ),
        });
      }

      /*
       * لو العميل طلب المنتجات بشكل عام
       */

      const available =
        getAvailableProducts(
          products
        );

      return NextResponse.json({
        message:
          "دي بعض المنتجات المتاحة حاليًا عندنا 🤍",
        products:
          available.map(
            toChatProduct
          ),
      });
    }

    /*
     * ========================================================
     * DEFAULT
     * ========================================================
     */

    return NextResponse.json({
      message:
        "أنا مساعد RAQEI 🤍\n\nأقدر أساعدك تعرف المنتجات، الأسعار، الخصومات والتوفر.\n\nمثال:\n• سعر المنتج ده كام؟\n• إيه المنتجات المتاحة؟\n• عندكم عروض؟\n• عايز حاجة تحت 1000 جنيه\n• إيه أرخص منتج عندكم؟",
      products: [],
    });
  } catch (error) {
    console.error(
      "CHATBOT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "حصلت مشكلة بسيطة وأنا بحاول أجيب البيانات. جرّب تاني بعد شوية.",
        products: [],
      },
      {
        status: 500,
      }
    );
  }
}