/**
 * Removes demo customer's projects, milestones, and related payment_ledger entries
 * so you get a clean start. Demo users (customer + designers) and their
 * registration/subscription state are kept. Run this then start the app;
 * ensureDemoAccounts will keep accounts and fees in place.
 *
 * Usage: npm run seed:clean
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const DEMO_CUSTOMER_EMAIL = "customer@interioros.com";

async function main() {
  const [customer] = await sql`select id from users where email = ${DEMO_CUSTOMER_EMAIL} limit 1`;
  if (!customer) {
    console.log("Demo customer not found. Nothing to clean.");
    return;
  }
  const customerId = customer.id;

  const projects = await sql`select id from projects where customer_id = ${customerId}`;
  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) {
    console.log("No demo projects found. Already clean.");
    return;
  }

  for (const { id: projectId } of projects) {
    const milestones = await sql`select id from milestones where project_id = ${projectId}`;
    for (const { id: milestoneId } of milestones) {
      try {
        await sql`delete from milestone_images where milestone_id = ${milestoneId}`;
      } catch {
        // table may not exist
      }
      try {
        await sql`delete from milestone_comments where milestone_id = ${milestoneId}`;
      } catch {
        // table may not exist
      }
    }
  }

  await sql`delete from payment_ledger where project_id in (select id from projects where customer_id = ${customerId})`;
  await sql`delete from milestones where project_id in (select id from projects where customer_id = ${customerId})`;
  await sql`delete from projects where customer_id = ${customerId}`;

  console.log("Clean complete: removed demo customer projects, milestones, and related payments.");
  console.log("Demo accounts (customer + designers) and registration fees are unchanged.");
}

main().catch((err) => {
  console.error("Seed clean failed:", err);
  process.exit(1);
});
