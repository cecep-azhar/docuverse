import { db } from "../lib/db";
import { apps, versions, languages, pages, users } from "../lib/schema";
import { hashPassword } from "../lib/auth";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("Seeding database...");

  // Create Admin
  const passwordHash = await hashPassword("admin");
  await db.insert(users).values({
    id: uuidv4(),
    email: "admin@docuverse.com",
    passwordHash,
    role: "admin",
  }).onConflictDoNothing();

  // Create App
  const appId = uuidv4();
  await db.insert(apps).values({
    id: appId,
    slug: "docuverse",
    name: "Docuverse",
    description: "The open source documentation platform.",
    logoUrl: "https://github.com/shadcn.png",
  }).onConflictDoNothing();

  // Create Versions
  const v1Id = uuidv4();
  const v2Id = uuidv4();
  await db.insert(versions).values([
    { id: v1Id, appId, slug: "v1", name: "1.0", isDefault: true },
    { id: v2Id, appId, slug: "v2", name: "2.0", isDefault: false },
  ]).onConflictDoNothing();

  // Create Languages
  const enId = uuidv4();
  const idId = uuidv4();
  await db.insert(languages).values([
    { id: enId, appId, code: "en", name: "English", isDefault: true },
    { id: idId, appId, code: "id", name: "Indonesia", isDefault: false },
  ]).onConflictDoNothing();

  // Create Pages for v1 en
  const homeId = uuidv4();
  const gettingStartedId = uuidv4();
  const installId = uuidv4();
  
  await db.insert(pages).values([
    {
      id: homeId,
      appId,
      versionId: v1Id,
      languageId: enId,
      slug: "introduction",
      title: "Introduction",
      content: "# Welcome to Docuverse\n\nThis is the best documentation platform.",
      order: 0,
      isFolder: false,
    },
    {
      id: gettingStartedId,
      appId,
      versionId: v1Id,
      languageId: enId,
      slug: "getting-started",
      title: "Getting Started",
      content: "# Getting Started\n\nLet's get you up and running.",
      order: 1,
      isFolder: true,
    },
    {
      id: installId,
      appId,
      versionId: v1Id,
      languageId: enId,
      slug: "installation",
      title: "Installation",
      content: "## Installation\n\nRun `npm install docuverse`",
      order: 0,
      parentId: gettingStartedId,
      isFolder: false,
    }
  ]).onConflictDoNothing();

  console.log("Seeding complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
