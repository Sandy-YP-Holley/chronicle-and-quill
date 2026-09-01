import { NextRequest } from "next/server";
import { z } from "zod";
import { Filter, Sort } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { escapeRegex } from "@/lib/validators";
import { HistoricalPeriodSchema, BookFormatSchema } from "@/models/book";

const BooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(100).optional(),
  period: HistoricalPeriodSchema.optional(),
  subject: z.string().trim().max(50).optional(),
  format: BookFormatSchema.optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  sort: z
    .enum(["relevance", "price_asc", "price_desc", "newest", "title"])
    .default("relevance"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawQuery: Record<string, string> = {};

    searchParams.forEach((val, key) => {
      rawQuery[key] = val;
    });

    const parsedQuery = BooksQuerySchema.safeParse(rawQuery);
    if (!parsedQuery.success) {
      return validationErrorResponse(parsedQuery.error, request.nextUrl.pathname);
    }

    const {
      page,
      limit,
      search,
      period,
      subject,
      format,
      priceMin,
      priceMax,
      inStock,
      sort,
    } = parsedQuery.data;

    const booksCollection = await getCollection("books");
    const filter: Filter<Record<string, unknown>> = { isDelisted: { $ne: true } };

    if (search && search.length > 0) {
      const sanitizedSearch = search.trim();

      if (/^[\d-]{9,17}$/.test(sanitizedSearch)) {
        filter.$or = [
          { isbn: sanitizedSearch },
          { isbn: sanitizedSearch.replace(/-/g, "") },
        ];
      } else {

        filter.$text = { $search: sanitizedSearch };
      }
    }

    if (period) {
      filter.period = period;
    }

    if (subject && subject.length > 0) {
      filter.subjects = {
        $elemMatch: {
          $regex: new RegExp(`^${escapeRegex(subject)}$`, "i"),
        },
      };
    }

    if (format) {
      filter.format = format;
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) {
        (filter.price as Record<string, number>).$gte = priceMin;
      }
      if (priceMax !== undefined) {
        (filter.price as Record<string, number>).$lte = priceMax;
      }
    }

    if (inStock) {
      filter.stock = { $gt: 0 };
    }

    let sortSpec: Sort = { createdAt: -1 };

    switch (sort) {
      case "relevance":
        if (filter.$text) {
          sortSpec = { score: { $meta: "textScore" } };
        } else {
          sortSpec = { featured: -1, createdAt: -1 };
        }
        break;
      case "price_asc":
        sortSpec = { price: 1 };
        break;
      case "price_desc":
        sortSpec = { price: -1 };
        break;
      case "newest":
        sortSpec = { createdAt: -1 };
        break;
      case "title":
        sortSpec = { title: 1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [totalItems, rawBooks] = await Promise.all([
      booksCollection.countDocuments(filter),
      booksCollection
        .find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const items = rawBooks.map((book) => ({
      id: book._id.toString(),
      title: book.title,
      authors: book.authors,
      period: book.period,
      subjects: book.subjects,
      description: book.description,
      isbn: book.isbn,
      format: book.format,
      price: book.price,
      stock: book.stock,
      imageUrl: book.imageUrl,
      pages: book.pages,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      featured: book.featured,
      rating: book.rating,
      createdAt: book.createdAt,
    }));

    return jsonResponse({
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/books:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "An unexpected error occurred while retrieving the catalog.",
      { instance: request.nextUrl.pathname }
    );
  }
}

