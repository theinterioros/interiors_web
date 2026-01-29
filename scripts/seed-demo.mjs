import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required to seed demo data.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const now = new Date();

function uuid() {
  return crypto.randomUUID();
}

async function main() {
  const [{ count }] = await sql`select count(*)::int as count from users`;
  if (count > 0) {
    console.log("Database already has data. Skipping demo seed.");
    return;
  }

  const adminId = uuid();
  const customerId = uuid();
  const firmId = uuid();
  const firmProfileId = uuid();
  const projectId = uuid();
  const milestoneId = uuid();

  await sql`
    insert into users (id, email, password_hash, role, name)
    values
      (${adminId}, 'admin@interioros.com', 'demo-hash', 'ADMIN', 'Interior OS Admin'),
      (${customerId}, 'customer@interioros.com', 'demo-hash', 'CUSTOMER', 'Aarav Sharma'),
      (${firmId}, 'firm@interioros.com', 'demo-hash', 'FIRM', 'Mira Kapoor')
  `;

  await sql`
    insert into admin_settings (
      id, otp_enabled, customer_registration_fee, firm_yearly_fee, digital_twin_yearly_fee
    )
    values (${uuid()}, true, 0, 0, 1000)
  `;

  const [{ settings_id }] = await sql`
    select id as settings_id from admin_settings limit 1
  `;

  await sql`
    insert into city_pincode_rates (id, settings_id, city, pincode, rate_per_sq_ft, is_active)
    values
      (${uuid()}, ${settings_id}, 'Mumbai', '400001', 1800, true),
      (${uuid()}, ${settings_id}, 'Bengaluru', '560001', 1600, true)
  `;

  await sql`
    insert into social_links (id, settings_id, platform, url)
    values (${uuid()}, ${settings_id}, 'Instagram', 'https://instagram.com/interior-os')
  `;

  await sql`
    insert into marketing_links (id, settings_id, label, url, show_in_header, show_in_footer, show_in_landing)
    values
      (${uuid()}, ${settings_id}, 'AI Cost Estimator', '/estimator', true, true, true),
      (${uuid()}, ${settings_id}, 'Firms', '/designers', true, true, true)
  `;

  await sql`
    insert into firm_profiles (
      id, user_id, firm_name, owner_name, office_address, name, experience_years, city, pincode, about, status
    )
    values (
      ${firmProfileId},
      ${firmId},
      'Studio Nirmaan',
      'Mira Kapoor',
      'Indiranagar, Bengaluru',
      'Mira Kapoor',
      8,
      'Bengaluru',
      '560001',
      'Premium residential interiors with a calm modern aesthetic.',
      'APPROVED'
    )
  `;

  await sql`
    insert into firm_portfolio_files (
      id, profile_id, blob_url, file_name, mime_type, size_bytes
    )
    values (
      ${uuid()},
      ${firmProfileId},
      'https://example.com/portfolio/sample.pdf',
      'sample-portfolio.pdf',
      'application/pdf',
      120000
    )
  `;

  await sql`
    insert into projects (id, customer_id, firm_id, status, title, description, created_at, updated_at)
    values (
      ${projectId},
      ${customerId},
      ${firmId},
      'ACTIVE',
      'Modern 3BHK Interior',
      'Full home interior with premium materials and smart storage.',
      ${now},
      ${now}
    )
  `;

  await sql`
    insert into milestones (id, project_id, title, description, amount, status)
    values (
      ${milestoneId},
      ${projectId},
      'Concept Design',
      'Moodboards, layout options, and material palette.',
      65000,
      'SUBMITTED'
    )
  `;

  await sql`
    insert into milestone_images (id, milestone_id, blob_url, file_name, mime_type, size_bytes)
    values (
      ${uuid()},
      ${milestoneId},
      'https://example.com/milestones/preview.jpg',
      'preview.jpg',
      'image/jpeg',
      220000
    )
  `;

  await sql`
    insert into payment_ledger (
      id, type, status, amount, project_id, milestone_id, customer_id, firm_id
    )
    values (
      ${uuid()},
      'MILESTONE',
      'HELD',
      65000,
      ${projectId},
      ${milestoneId},
      ${customerId},
      ${firmId}
    )
  `;

  await sql`
    insert into digital_twin_files (
      id, customer_id, category, blob_url, file_name, mime_type, size_bytes, uploaded_by
    )
    values (
      ${uuid()},
      ${customerId},
      'FLOOR_PLAN',
      'https://example.com/digital-twin/floor-plan.pdf',
      'floor-plan.pdf',
      'application/pdf',
      180000,
      ${customerId}
    )
  `;

  await sql`
    insert into notifications (id, user_id, type, title, message)
    values (
      ${uuid()},
      ${firmId},
      'PROJECT_REQUEST',
      'New project request',
      'A new project request is waiting for your response.'
    )
  `;

  console.log("Demo seed complete.");
}

main().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exit(1);
});
