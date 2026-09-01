"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookPlus,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  X,
  RefreshCw,
  Link2,
} from "lucide-react";
import { useStore } from "@/context/store-context";

const PERIODS = ["Antiquity", "Medieval", "Early Modern", "20th Century"] as const;
const FORMATS = ["Hardcover", "Leather-bound", "Paperback", "Archival Reprint"] as const;

const PRESET_COVERS = [
  { label: "Classical Calfskin", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80" },
  { label: "Gilded Antiquarian", url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80" },
  { label: "Medieval Vellum", url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80" },
  { label: "Marbled Parchment", url: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80" },
];

export default function NewBookPage() {
  const router = useRouter();
  const { showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [period, setPeriod] = useState<typeof PERIODS[number]>("Antiquity");
  const [subjects, setSubjects] = useState("");
  const [isbn, setIsbn] = useState("");
  const [format, setFormat] = useState<typeof FORMATS[number]>("Hardcover");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("5");
  const [imageUrl, setImageUrl] = useState("");
  const [pages, setPages] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [description, setDescription] = useState("");

  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleFileProcess(file: File) {
    setUploadError(null);

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validMimes.includes(file.type)) {
      setUploadError("Invalid file type. Allowed formats are JPEG, PNG, WebP, and AVIF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds maximum allowed size of 10 MB. Please upload a smaller image.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);
    setUploadedFileName(file.name);
    setUploadedFileSize(file.size);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.imageUrl) {
        setImageUrl(data.imageUrl);
        if (fieldErrors.imageUrl) {
          setFieldErrors((prev) => ({ ...prev, imageUrl: "" }));
        }
        showToast("Archival folio cover uploaded successfully.", "success");
      } else {
        const errorMsg =
          data.detail || data.errors?.file?.[0] || "Failed to upload manuscript image.";
        setUploadError(errorMsg);
      }
    } catch {
      setUploadError("Network error while uploading cover image.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  }

  function handleRemoveImage() {
    setLocalPreviewUrl(null);
    setUploadedFileName("");
    setUploadedFileSize(null);
    setImageUrl("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const clientErrors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 2) {
      clientErrors.title = "Title is required and must be between 2 and 200 characters";
    }

    const authorList = authors
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (authorList.length === 0) {
      clientErrors.authors = "At least one author is required";
    }

    const subjectList = subjects
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (subjectList.length === 0) {
      clientErrors.subjects = "At least one subject category tag is required";
    }

    if (!isbn.trim() || isbn.trim().length < 10) {
      clientErrors.isbn = "ISBN must be a valid 10 or 13-character standard book identifier (e.g., 978-0140449082)";
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0.5 || numPrice > 50000) {
      clientErrors.price = "Price must be a positive numeric value in USD (min: $0.50, max: $50,000.00)";
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      clientErrors.stock = "Stock must be an integer greater than or equal to 0";
    }

    if (!imageUrl.trim()) {
      clientErrors.imageUrl = "Cover art image is required. Upload a file or provide a valid URL.";
    }

    if (!description.trim() || description.trim().length < 10) {
      clientErrors.description = "Bibliographical description is required and must be between 10 and 5,000 characters";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setErrorMessage(`Validation failed on [${Object.keys(clientErrors).join(", ")}]. Please correct the highlighted fields.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {
        title: title.trim(),
        authors: authorList,
        period,
        subjects: subjectList,
        isbn: isbn.trim(),
        format,
        price: Number(numPrice.toFixed(2)),
        stock: numStock,
        imageUrl: imageUrl.trim(),
        description: description.trim(),
      };

      if (pages.trim()) payload.pages = parseInt(pages, 10);
      if (publisher.trim()) payload.publisher = publisher.trim();
      if (publicationYear.trim()) payload.publicationYear = parseInt(publicationYear, 10);

      const res = await fetch("/api/seller/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Rare volume cataloged successfully!", "success");
        router.push("/seller/dashboard");
      } else {
        if (data.errors && typeof data.errors === "object") {
          const parsed: Record<string, string> = {};
          Object.entries(data.errors).forEach(([k, v]) => {
            parsed[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setFieldErrors(parsed);
        }
        setErrorMessage(data.detail || "Failed to catalog manuscript.");
      }
    } catch {
      setErrorMessage("Network error while submitting manuscript listing.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="mb-6">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center gap-2 text-xs font-cinzel text-stone-500 hover:text-burgundy-700 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dealership Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-md p-6 sm:p-10">
        <div className="flex items-center gap-3 pb-6 mb-8 border-b border-stone-200">
          <div className="w-10 h-10 rounded-lg bg-burgundy-700 text-parchment-50 flex items-center justify-center shadow-xs">
            <BookPlus className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-ink-900">
              Catalog a Rare Historical Folio
            </h1>
            <p className="text-xs text-stone-500 font-serif">
              Add authentic manuscripts, primary source translations, or historical reprints to The Stacks.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-serif rounded mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Manuscript Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="e.g., De Rerum Natura (The Nature of Things)"
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-serif ${
                  fieldErrors.title
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.title}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Author(s) * (comma-separated)
              </label>
              <input
                type="text"
                required
                value={authors}
                onChange={(e) => {
                  setAuthors(e.target.value);
                  if (fieldErrors.authors) setFieldErrors((prev) => ({ ...prev, authors: "" }));
                }}
                placeholder="e.g., Lucretius, Thomas Browne"
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-serif ${
                  fieldErrors.authors
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              />
              {fieldErrors.authors && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.authors}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                ISBN Standard Identifier *
              </label>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => {
                  setIsbn(e.target.value);
                  if (fieldErrors.isbn) setFieldErrors((prev) => ({ ...prev, isbn: "" }));
                }}
                placeholder="e.g., 978-0199537907"
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-mono ${
                  fieldErrors.isbn
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              />
              {fieldErrors.isbn && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.isbn}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Historical Epoch *
              </label>
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value as typeof PERIODS[number]);
                  if (fieldErrors.period) setFieldErrors((prev) => ({ ...prev, period: "" }));
                }}
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-serif cursor-pointer ${
                  fieldErrors.period
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {fieldErrors.period && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.period}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Binding Format *
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value as typeof FORMATS[number]);
                  if (fieldErrors.format) setFieldErrors((prev) => ({ ...prev, format: "" }));
                }}
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-serif cursor-pointer ${
                  fieldErrors.format
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {fieldErrors.format && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.format}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Acquisition Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.50"
                max="50000"
                required
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: "" }));
                }}
                placeholder="45.00"
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-mono font-bold ${
                  fieldErrors.price
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              />
              {fieldErrors.price && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.price}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Initial Stock Inventory *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (fieldErrors.stock) setFieldErrors((prev) => ({ ...prev, stock: "" }));
                }}
                placeholder="5"
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-mono ${
                  fieldErrors.stock
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              />
              {fieldErrors.stock && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.stock}</span>
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Subject Categories * (comma-separated)
              </label>
              <input
                type="text"
                required
                value={subjects}
                onChange={(e) => {
                  setSubjects(e.target.value);
                  if (fieldErrors.subjects) setFieldErrors((prev) => ({ ...prev, subjects: "" }));
                }}
                placeholder="e.g., Epicureanism, Roman Philosophy, Natural Sciences, Latin Literature"
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-serif ${
                  fieldErrors.subjects
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                }`}
              />
              {fieldErrors.subjects && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.subjects}</span>
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-cinzel uppercase font-bold text-stone-700">
                  Manuscript Cover Art *
                </label>
                <div className="flex rounded-md border border-stone-200 p-0.5 bg-stone-50">
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`flex items-center gap-1 px-3 py-1 text-[11px] font-cinzel uppercase font-bold rounded transition-colors cursor-pointer ${
                      imageMode === "upload"
                        ? "bg-burgundy-700 text-parchment-50 shadow-xs"
                        : "text-stone-600 hover:text-ink-900"
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Local File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`flex items-center gap-1 px-3 py-1 text-[11px] font-cinzel uppercase font-bold rounded transition-colors cursor-pointer ${
                      imageMode === "url"
                        ? "bg-burgundy-700 text-parchment-50 shadow-xs"
                        : "text-stone-600 hover:text-ink-900"
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Remote URL / Presets</span>
                  </button>
                </div>
              </div>

              {imageMode === "upload" ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                  />

                  {localPreviewUrl || (imageUrl && imageUrl.startsWith("/api/images/")) ? (
                    <div className="relative bg-parchment-50 border border-gold-500/60 rounded-lg p-4 flex items-center gap-4">
                      <div className="relative w-20 h-28 rounded overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                        <Image
                          src={localPreviewUrl || imageUrl}
                          alt="Uploaded cover preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Cover Archived in Vault</span>
                        </div>
                        <p className="text-xs font-mono text-ink-900 truncate">
                          {uploadedFileName || "Archival Image"}
                        </p>
                        {uploadedFileSize && (
                          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                            {formatBytes(uploadedFileSize)} &bull; Ready for cataloging
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="text-xs font-cinzel uppercase text-burgundy-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Replace Cover</span>
                          </button>
                          <span className="text-stone-300">&bull;</span>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isUploadingImage}
                            className="text-xs font-cinzel uppercase text-red-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        dragActive
                          ? "border-burgundy-700 bg-parchment-100 scale-[1.01]"
                          : fieldErrors.imageUrl || uploadError
                          ? "border-red-500 bg-red-50/50"
                          : "border-stone-300 hover:border-gold-500 bg-parchment-50/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-parchment-100 text-burgundy-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                        {isUploadingImage ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-gold-600" />
                        ) : (
                          <UploadCloud className="w-6 h-6 text-burgundy-700" />
                        )}
                      </div>
                      <p className="text-xs font-cinzel uppercase font-bold text-ink-900 mb-1">
                        {isUploadingImage
                          ? "Uploading to Archival Vault..."
                          : "Drag & drop rare volume cover or browse files"}
                      </p>
                      <p className="text-[11px] text-stone-500 font-serif">
                        Formats: JPEG, PNG, WebP, AVIF &bull; Maximum file size: 10 MB
                      </p>
                      <button
                        type="button"
                        className="mt-4 px-4 py-1.5 bg-white border border-stone-300 hover:border-burgundy-700 rounded text-xs font-cinzel uppercase text-stone-700 font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Select Cover from PC
                      </button>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (fieldErrors.imageUrl) setFieldErrors((prev) => ({ ...prev, imageUrl: "" }));
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-mono text-[11px] ${
                      fieldErrors.imageUrl
                        ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                        : "border-stone-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-serif text-stone-500">
                    <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Curated Folio Presets:</span>
                    {PRESET_COVERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          setLocalPreviewUrl(null);
                          if (fieldErrors.imageUrl) setFieldErrors((prev) => ({ ...prev, imageUrl: "" }));
                        }}
                        className="underline hover:text-burgundy-700 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {fieldErrors.imageUrl && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.imageUrl}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Page Count (optional)
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="320"
                className="w-full bg-parchment-50 border border-stone-300 rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Press or Publisher (optional)
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="e.g., Oxford Classical Texts"
                className="w-full bg-parchment-50 border border-stone-300 rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none focus:border-gold-500 font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Publication Year (optional)
              </label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value)}
                placeholder="e.g., 1687"
                className="w-full bg-parchment-50 border border-stone-300 rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-cinzel uppercase font-bold text-stone-700 mb-2">
                Bibliographical Description &amp; Provenance Notes *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: "" }));
                }}
                placeholder="Detailed commentary on historical context, translation notes, and archival condition..."
                className={`w-full bg-parchment-50 border rounded px-3.5 py-2 text-xs text-ink-900 focus:outline-none transition-colors font-serif ${
                  fieldErrors.description
                    ? "border-red-600 focus:ring-1 focus:ring-red-600 focus:border-red-600"
                    : "border-stone-300 focus:border-gold-500"
                }`}
              />
              {fieldErrors.description && (
                <p className="text-[11px] text-red-700 font-serif mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.description}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-200">
            <Link
              href="/seller/dashboard"
              className="text-xs font-cinzel text-stone-500 hover:text-ink-900 uppercase tracking-wider"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="bg-burgundy-700 text-parchment-50 px-6 py-2.5 rounded font-cinzel text-xs uppercase tracking-wider hover:bg-burgundy-800 transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Cataloging..." : "Submit to The Stacks"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
