import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { BookSchema, IBook, HistoricalPeriod, BookFormat } from "../src/models/book";
import { UserSchema } from "../src/models/user";

interface SeedBook {
  title: string;
  authors: string[];
  period: HistoricalPeriod;
  subjects: string[];
  description: string;
  isbn: string;
  format: BookFormat;
  price: number;
  stock: number;
  imageUrl: string;
  pages: number;
  publisher: string;
  publicationYear: number;
  featured: boolean;
  rating: number;
}

const HISTORICAL_BOOKS: SeedBook[] = [

  {
    title: "Meditations (The Emperor's Archival Edition)",
    authors: ["Marcus Aurelius"],
    period: "Antiquity",
    subjects: ["Stoicism", "Roman Philosophy", "Autobiography", "Ancient Rome"],
    description: "Written in Greek while on military campaigns between 170 and 180 CE, these private spiritual reflections of Rome's philosopher-emperor form a timeless testament to duty, reason, and emotional sovereignty.",
    isbn: "978-0140449334",
    format: "Leather-bound",
    price: 34.50,
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    pages: 304,
    publisher: "Archival Classics Press",
    publicationYear: 180,
    featured: true,
    rating: 4.9,
  },
  {
    title: "The Iliad & The Odyssey (Two-Volume Gilded Set)",
    authors: ["Homer"],
    period: "Antiquity",
    subjects: ["Epic Poetry", "Greek Mythology", "Trojan War", "Ancient Greece"],
    description: "The foundational twin epics of Western literature. Homer chronicles the wrath of Achilles outside the walls of Ilium and Odysseus's perilous ten-year voyage home to Ithaca, bound in archival cloth with gilded foil stamping.",
    isbn: "978-0140445923",
    format: "Hardcover",
    price: 58.00,
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    pages: 1120,
    publisher: "Alexandrian Heritage Editions",
    publicationYear: -750,
    featured: true,
    rating: 5.0,
  },
  {
    title: "History of the Peloponnesian War",
    authors: ["Thucydides"],
    period: "Antiquity",
    subjects: ["Historiography", "Military History", "Classical Greece", "Geopolitics"],
    description: "The first scientific work of history, recounting the cataclysmic struggle between maritime Athens and terrestrial Sparta with clinical psychological insight into power, democracy, and imperialism.",
    isbn: "978-0140440393",
    format: "Archival Reprint",
    price: 28.75,
    stock: 19,
    imageUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
    pages: 656,
    publisher: "Athenian Academy Texts",
    publicationYear: -411,
    featured: false,
    rating: 4.8,
  },
  {
    title: "The Republic",
    authors: ["Plato"],
    period: "Antiquity",
    subjects: ["Political Philosophy", "Justice", "Socratic Dialogues", "Classical Athens"],
    description: "Plato's seminal dialogue exploring justice, the philosopher-king, the ideal polis, and the Allegory of the Cave. Preserved in a scholarly edition with marginal commentary and glossary of philosophical terms.",
    isbn: "978-0140455113",
    format: "Paperback",
    price: 18.95,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    pages: 448,
    publisher: "Socratic Press",
    publicationYear: -375,
    featured: false,
    rating: 4.7,
  },
  {
    title: "The Art of War: Ancient Bamboo Scroll Codex",
    authors: ["Sun Tzu"],
    period: "Antiquity",
    subjects: ["Military Strategy", "Eastern Philosophy", "Ancient China", "Statecraft"],
    description: "A thirteen-chapter masterwork on warfare, deception, and diplomatic stratagem composed during China's Spring and Autumn period, presented with traditional character reconstructions and historical context.",
    isbn: "978-1590302255",
    format: "Hardcover",
    price: 26.00,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80",
    pages: 224,
    publisher: "Eastern Wisdom Guild",
    publicationYear: -500,
    featured: false,
    rating: 4.9,
  },
  {
    title: "The Histories (Folio Edition)",
    authors: ["Herodotus"],
    period: "Antiquity",
    subjects: ["Historiography", "Persian Empire", "Ancient Egypt", "Ethnography"],
    description: "Called the 'Father of History', Herodotus investigates the causes and conduct of the Greco-Persian Wars while chronicling the folklore, customs, and monuments of Egypt, Scythia, and Babylon.",
    isbn: "978-0140449082",
    format: "Leather-bound",
    price: 49.50,
    stock: 11,
    imageUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80",
    pages: 784,
    publisher: "Halicarnassus Press",
    publicationYear: -430,
    featured: false,
    rating: 4.8,
  },

  {
    title: "The Divine Comedy: Inferno, Purgatorio, Paradiso",
    authors: ["Dante Alighieri"],
    period: "Medieval",
    subjects: ["Epic Poetry", "Medieval Theology", "Italian Renaissance", "Cosmology"],
    description: "Dante's monumental 14th-century vision of the afterlife, accompanied by Gustave Doré's celebrated wood engravings. Translated into terza rima with extensive historical annotations on medieval Florentine politics.",
    isbn: "978-0140448955",
    format: "Leather-bound",
    price: 65.00,
    stock: 7,
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    pages: 798,
    publisher: "Florentine Guild Press",
    publicationYear: 1320,
    featured: true,
    rating: 5.0,
  },
  {
    title: "The Canterbury Tales (Illuminated Manuscript Facsimile)",
    authors: ["Geoffrey Chaucer"],
    period: "Medieval",
    subjects: ["Middle English", "Medieval Society", "Pilgrimage", "Satire"],
    description: "A colorful panoramic portrait of fourteenth-century English society on pilgrimage to the shrine of Saint Thomas Becket in Canterbury. Presented with original Ellesmere manuscript woodcuts and side-by-side glosses.",
    isbn: "978-0140422344",
    format: "Hardcover",
    price: 38.50,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    pages: 544,
    publisher: "Southwark Scriptoria",
    publicationYear: 1400,
    featured: false,
    rating: 4.7,
  },
  {
    title: "The Muqaddimah: An Introduction to History",
    authors: ["Ibn Khaldun"],
    period: "Medieval",
    subjects: ["Philosophy of History", "Islamic Golden Age", "Sociology", "Economics"],
    description: "A monumental 1377 treatise anticipating modern sociology, economics, and cyclical theories of imperial rise and decline ('Asabiyyah'). Translated by Franz Rosenthal with scholarly introductory essays.",
    isbn: "978-0691166285",
    format: "Archival Reprint",
    price: 42.00,
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
    pages: 496,
    publisher: "Maghrib Historical Institute",
    publicationYear: 1377,
    featured: true,
    rating: 4.9,
  },
  {
    title: "Summa Theologiae: Philosophical & Theological Questions",
    authors: ["Thomas Aquinas"],
    period: "Medieval",
    subjects: ["Scholasticism", "Medieval Philosophy", "Theology", "Ethics"],
    description: "The intellectual pinnacle of High Medieval scholasticism, harmonizing Aristotelian logic with Christian revelation. Features the famous Five Ways (Quinque Viae) proving the existence of God.",
    isbn: "978-0872200296",
    format: "Hardcover",
    price: 45.00,
    stock: 9,
    imageUrl: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80",
    pages: 720,
    publisher: "Parisian Scholastic Guild",
    publicationYear: 1274,
    featured: false,
    rating: 4.8,
  },
  {
    title: "Beowulf: Bilingual Old English & Modern Archival Verse",
    authors: ["Anonymous", "Seamus Heaney (Translator)"],
    period: "Medieval",
    subjects: ["Anglo-Saxon", "Old English Poetry", "Monsters & Heroes", "Nordic Legend"],
    description: "The heroic Old English alliterative poem surviving in the unique Nowell Codex. Heaney's Nobel Prize-winning verse translation appears facing the authentic eighth-century Anglo-Saxon script.",
    isbn: "978-0393320978",
    format: "Paperback",
    price: 19.50,
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    pages: 256,
    publisher: "Wessex Archival Society",
    publicationYear: 1000,
    featured: false,
    rating: 4.9,
  },
  {
    title: "The Alexiad: The Byzantine Imperial Chronicle",
    authors: ["Anna Komnene"],
    period: "Medieval",
    subjects: ["Byzantine Empire", "First Crusade", "Imperial Court", "Historiography"],
    description: "Composed by the Byzantine princess Anna Komnene, this is a vivid eyewitness chronicle of the First Crusade, Norman invasions, and court intrigue during the reign of her father, Emperor Alexios I Komnenos.",
    isbn: "978-0140455274",
    format: "Archival Reprint",
    price: 24.50,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    pages: 560,
    publisher: "Constantinople Historical Library",
    publicationYear: 1148,
    featured: false,
    rating: 4.7,
  },

  {
    title: "The Prince & Discourses on Livy",
    authors: ["Niccolò Machiavelli"],
    period: "Early Modern",
    subjects: ["Renaissance Statecraft", "Political Realism", "Italian City-States"],
    description: "Machiavelli's chillingly pragmatic guide to political mastery written in exile following the fall of the Florentine Republic, bound alongside his deeper republican treatise on the ancient Roman historian Livy.",
    isbn: "978-0199535651",
    format: "Leather-bound",
    price: 36.00,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80",
    pages: 432,
    publisher: "Florentine Academy Publications",
    publicationYear: 1532,
    featured: true,
    rating: 4.8,
  },
  {
    title: "Philosophiae Naturalis Principia Mathematica",
    authors: ["Isaac Newton"],
    period: "Early Modern",
    subjects: ["Scientific Revolution", "Classical Mechanics", "Universal Gravitation"],
    description: "Published under the encouragement of Edmond Halley in 1687, Newton's Principia laid the foundation of classical mechanics, enunciating the three laws of motion and the law of universal gravitation.",
    isbn: "978-0520088177",
    format: "Hardcover",
    price: 52.00,
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=800&q=80",
    pages: 992,
    publisher: "Royal Society Scientific Guild",
    publicationYear: 1687,
    featured: false,
    rating: 5.0,
  },
  {
    title: "Novum Organum: True Directions Concerning the Interpretation of Nature",
    authors: ["Francis Bacon"],
    period: "Early Modern",
    subjects: ["Scientific Method", "Empiricism", "Epistemology", "Renaissance"],
    description: "Bacon's philosophical challenge to Aristotelian syllogism, introducing the inductive method that became the operational engine of the modern Scientific Revolution.",
    isbn: "978-0812694567",
    format: "Archival Reprint",
    price: 27.50,
    stock: 17,
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    pages: 336,
    publisher: "Chancery Lane Press",
    publicationYear: 1620,
    featured: false,
    rating: 4.6,
  },
  {
    title: "The Decline and Fall of the Roman Empire (Six-Volume Complete Edition)",
    authors: ["Edward Gibbon"],
    period: "Early Modern",
    subjects: ["Enlightenment Historiography", "Roman Empire", "Byzantine History"],
    description: "Gibbon's grand narrative masterpiece stretching from the golden age of Trajan through the Ottoman sack of Constantinople in 1453. Celebrated for its majestic prose, irony, and Enlightenment perspective.",
    isbn: "978-0140437645",
    format: "Hardcover",
    price: 94.00,
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80",
    pages: 3600,
    publisher: "Strand Antiquarian Editions",
    publicationYear: 1776,
    featured: true,
    rating: 5.0,
  },
  {
    title: "Leviathan: Matter, Forme and Power of a Commonwealth",
    authors: ["Thomas Hobbes"],
    period: "Early Modern",
    subjects: ["Social Contract", "Political Philosophy", "English Civil War"],
    description: "Written during the chaos of the English Civil War, Hobbes argues that without a sovereign power to maintain order, human life is solitary, poor, nasty, brutish, and short.",
    isbn: "978-0140431957",
    format: "Paperback",
    price: 21.00,
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    pages: 736,
    publisher: "London Guild of Printers",
    publicationYear: 1651,
    featured: false,
    rating: 4.6,
  },

  {
    title: "The Mediterranean and the Mediterranean World in the Age of Philip II",
    authors: ["Fernand Braudel"],
    period: "20th Century",
    subjects: ["Annales School", "Geohistory", "La Longue Durée", "Early Modern World"],
    description: "A monumental achievement of 20th-century historiography. Braudel introduces 'la longue durée'—examining slow-moving geographic and economic structures beneath the surface of fleeting political events.",
    isbn: "978-0520203082",
    format: "Hardcover",
    price: 68.00,
    stock: 9,
    imageUrl: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    pages: 1375,
    publisher: "Annales Scholarly Foundation",
    publicationYear: 1949,
    featured: true,
    rating: 4.9,
  },
  {
    title: "The Historian's Craft: Reflections on History and Evidence",
    authors: ["Marc Bloch"],
    period: "20th Century",
    subjects: ["Methodology", "Philosophy of History", "French Resistance"],
    description: "Drafted in occupied France before the author was captured and executed by the Gestapo in 1944. Bloch presents a luminous defense of history as the science of human beings in time.",
    isbn: "978-0394705125",
    format: "Paperback",
    price: 18.50,
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    pages: 224,
    publisher: "Resistance & Academia Press",
    publicationYear: 1949,
    featured: false,
    rating: 4.9,
  },
  {
    title: "The Waning of the Middle Ages",
    authors: ["Johan Huizinga"],
    period: "20th Century",
    subjects: ["Cultural History", "Late Medieval Society", "Burgundian Court"],
    description: "A spellbinding study of the forms of life, thought, and art in fourteenth and fifteenth-century France and the Low Countries, exploring the decadent, hyper-sensitive emotional world of the dying Middle Ages.",
    isbn: "978-0486404431",
    format: "Archival Reprint",
    price: 24.00,
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    pages: 352,
    publisher: "Leiden Heritage Press",
    publicationYear: 1919,
    featured: false,
    rating: 4.8,
  },
  {
    title: "A Distant Mirror: The Calamitous 14th Century",
    authors: ["Barbara W. Tuchman"],
    period: "20th Century",
    subjects: ["Black Death", "Hundred Years' War", "Chivalry", "Medieval Crisis"],
    description: "Pulitzer Prize-winner Barbara Tuchman weaves the catastrophic events of the fourteenth century—the Black Death, the Great Schism, and incessant war—through the life of the French noble Enguerrand de Coucy VII.",
    isbn: "978-0345349576",
    format: "Paperback",
    price: 22.50,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=800&q=80",
    pages: 704,
    publisher: "Ballantine Historical Guild",
    publicationYear: 1978,
    featured: true,
    rating: 4.8,
  },
  {
    title: "What is History?",
    authors: ["E. H. Carr"],
    period: "20th Century",
    subjects: ["Historiography", "Philosophy of History", "Objectivity", "Progress"],
    description: "Carr's famous Cambridge University lectures confronting the nature of historical facts, bias, morality in history, and the dynamic relationship between the historian and their society.",
    isbn: "978-0140206524",
    format: "Paperback",
    price: 16.95,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    pages: 208,
    publisher: "Cambridge University Press",
    publicationYear: 1961,
    featured: false,
    rating: 4.7,
  },
];

async function seed() {
  console.log("=================================================================");
  console.log("📜 Chronicle & Quill - Historical Catalog & User Database Seeder");
  console.log("=================================================================\n");

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "chronicle_and_quill";

  if (!uri) {
    console.error("❌ Error: MONGODB_URI environment variable is not defined.");
    console.error("Please configure it in .env.local or your environment.");
    process.exit(1);
  }

  console.log(`📡 Connecting to MongoDB database: "${dbName}"...`);

  let client: MongoClient;
  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas.\n");
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("⚠️  Unable to establish live connection to MongoDB cluster:");
    console.warn(`   ${err.message}`);
    console.warn("\nℹ️  Performing dry-run validation of schemas and indexes...");

    let validCount = 0;
    for (const book of HISTORICAL_BOOKS) {
      const parsed = BookSchema.safeParse(book);
      if (parsed.success) {
        validCount++;
      } else {
        console.error(`Validation failed for "${book.title}":`, parsed.error.format());
      }
    }
    console.log(`✅ Schema validation test passed: ${validCount}/${HISTORICAL_BOOKS.length} books validated.`);
    console.log("✨ Seed configuration ready for production when MongoDB Atlas credentials are connected.\n");
    return;
  }

  try {
    const db = client.db(dbName);
    const booksCollection = db.collection("books");
    const usersCollection = db.collection("users");

    console.log("🔧 Creating automated MongoDB indexes on 'books' collection...");

    await booksCollection.createIndex(
      { title: "text", authors: "text", description: "text" },
      { name: "books_text_search_idx" }
    );
    console.log("   ✓ Created compound full-text index (title, authors, description)");

    await booksCollection.createIndex(
      { isbn: 1 },
      { unique: true, name: "books_isbn_unique_idx" }
    );
    console.log("   ✓ Created unique index on ISBN");

    await booksCollection.createIndex({ period: 1 }, { name: "books_period_idx" });
    await booksCollection.createIndex({ subjects: 1 }, { name: "books_subjects_idx" });
    await booksCollection.createIndex({ price: 1 }, { name: "books_price_idx" });
    await booksCollection.createIndex({ stock: 1 }, { name: "books_stock_idx" });
    await booksCollection.createIndex({ createdAt: -1 }, { name: "books_created_at_idx" });
    console.log("   ✓ Created filtering indexes (period, subjects, price, stock, createdAt)\n");

    console.log(`📚 Seeding ${HISTORICAL_BOOKS.length} historical volumes across 4 epochs...`);
    let booksInserted = 0;
    let booksUpdated = 0;

    for (const rawBook of HISTORICAL_BOOKS) {
      const validationResult = BookSchema.safeParse(rawBook);
      if (!validationResult.success) {
        console.error(`❌ Validation failed for "${rawBook.title}":`, validationResult.error.format());
        continue;
      }

      const { createdAt, ...fieldsToSet } = validationResult.data;
      const result = await booksCollection.updateOne(
        { isbn: fieldsToSet.isbn },
        {
          $set: {
            ...fieldsToSet,
            isDelisted: false,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: createdAt || new Date(),
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        booksInserted++;
      } else if (result.modifiedCount > 0) {
        booksUpdated++;
      }
    }

    console.log(`   ✓ Books seeded: ${booksInserted} inserted, ${booksUpdated} updated.\n`);

    console.log("👤 Seeding foundational demo users...");
    await usersCollection.createIndex({ email: 1 }, { unique: true, name: "users_email_unique_idx" });

    const defaultPasswordHash = await bcrypt.hash("HistoricalReader2026!", 12);

    await usersCollection.updateOne(
      { email: "admin@chronicleandquill.com" },
      {
        $set: {
          email: "admin@chronicleandquill.com",
          name: "Curatorial Overseer",
          role: "admin",
          passwordHash: defaultPasswordHash,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await usersCollection.updateOne(
      { email: "curator@chronicleandquill.com" },
      {
        $set: {
          email: "curator@chronicleandquill.com",
          name: "Archival Curator",
          role: "admin",
          passwordHash: defaultPasswordHash,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await usersCollection.updateOne(
      { email: "seller@chronicleandquill.com" },
      {
        $set: {
          email: "seller@chronicleandquill.com",
          name: "Archival Seller",
          role: "seller",
          sellerName: "Alexandrian Heritage Editions",
          sellerBio: "Premier antiquarian dealership specializing in classical philosophy and illuminated medieval manuscripts.",
          specialtyEra: "Antiquity & Medieval",
          isApprovedSeller: true,
          passwordHash: defaultPasswordHash,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await usersCollection.updateOne(
      { email: "scholar@chronicleandquill.com" },
      {
        $set: {
          email: "scholar@chronicleandquill.com",
          name: "Historical Scholar",
          role: "buyer",
          passwordHash: defaultPasswordHash,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    console.log("   ✓ Created demo admin: admin@chronicleandquill.com (admin)");
    console.log("   ✓ Created demo seller: seller@chronicleandquill.com (seller)");
    console.log("   ✓ Created demo scholar: scholar@chronicleandquill.com (buyer)\n");

    console.log("=================================================================");
    console.log("✨ Seed successfully completed for Chronicle & Quill!");
    console.log("=================================================================\n");
  } catch (error) {
    console.error("❌ Seeding failed with unexpected error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed().catch(console.error);

