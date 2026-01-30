import crypto from "crypto";
import { hashPassword } from "@/lib/password";
import { sql } from "@/lib/db";

/** Demo credentials — aligned with DEMO.md and scripts/seed-demo.mjs. Password: Demo123! */
const DEMO_CUSTOMER_EMAIL = "customer@interioros.com";
const DEMO_CUSTOMER_PASSWORD = "Demo123!";
const DEMO_CUSTOMER_NAME = "Aarav Sharma";

const DEMO_FIRM_EMAIL = "firm@interioros.com";
const DEMO_FIRM_PASSWORD = "Demo123!";
const DEMO_FIRM_PHONE = "9876543211";
const DEMO_FIRM_NAME = "Studio Nirmaan";
const DEMO_FIRM_OWNER = "Mira Kapoor";
const DEMO_FIRM_ADDRESS = "Indiranagar, Bengaluru";
const DEMO_FIRM_CITY = "Bengaluru";
const DEMO_FIRM_PINCODE = "560038";
const DEMO_FIRM_ABOUT = "Premium residential interiors with a calm modern aesthetic. 8+ years experience.";

export async function ensureDemoAccounts() {
  try {
    const [existingCustomer] = await sql<{ id: string }>`
      select id from users where email = ${DEMO_CUSTOMER_EMAIL} limit 1
    `;
    const [existingFirm] = await sql<{ id: string }>`
      select id from users where email = ${DEMO_FIRM_EMAIL} limit 1
    `;

    let customerId: string;
    let firmId: string;

    if (!existingCustomer) {
      customerId = crypto.randomUUID();
      const passwordHash = await hashPassword(DEMO_CUSTOMER_PASSWORD);
      await sql`
        insert into users (id, email, password_hash, role, name)
        values (${customerId}, ${DEMO_CUSTOMER_EMAIL}, ${passwordHash}, 'CUSTOMER', ${DEMO_CUSTOMER_NAME})
      `;
      await sql`
        insert into payment_ledger (id, type, status, amount, currency, customer_id)
        values (${crypto.randomUUID()}, 'CUSTOMER_REGISTRATION_FEE', 'RELEASED', 1000, 'INR', ${customerId})
      `;
    } else {
      customerId = existingCustomer.id;
      const [hasPaid] = await sql<{ id: string }>`
        select id from payment_ledger where customer_id = ${customerId} and type = 'CUSTOMER_REGISTRATION_FEE' and status = 'RELEASED' limit 1
      `;
      if (!hasPaid) {
        await sql`
          insert into payment_ledger (id, type, status, amount, currency, customer_id)
          values (${crypto.randomUUID()}, 'CUSTOMER_REGISTRATION_FEE', 'RELEASED', 1000, 'INR', ${customerId})
        `;
      }
    }

    if (!existingFirm) {
      firmId = crypto.randomUUID();
      const passwordHash = await hashPassword(DEMO_FIRM_PASSWORD);
      await sql`
        insert into users (id, email, phone, password_hash, role, name)
        values (${firmId}, ${DEMO_FIRM_EMAIL}, ${DEMO_FIRM_PHONE}, ${passwordHash}, 'FIRM', ${DEMO_FIRM_OWNER})
      `;
      const profileId = crypto.randomUUID();
      await sql`
        insert into firm_profiles (
          id, user_id, firm_name, owner_name, office_address,
          name, experience_years, city, pincode, about, status, verified_at
        )
        values (
          ${profileId},
          ${firmId},
          ${DEMO_FIRM_NAME},
          ${DEMO_FIRM_OWNER},
          ${DEMO_FIRM_ADDRESS},
          ${DEMO_FIRM_OWNER},
          8,
          ${DEMO_FIRM_CITY},
          ${DEMO_FIRM_PINCODE},
          ${DEMO_FIRM_ABOUT},
          'APPROVED',
          now()
        )
      `;
      await sql`
        insert into payment_ledger (id, type, status, amount, currency, firm_id)
        values (${crypto.randomUUID()}, 'FIRM_REGISTRATION_FEE', 'RELEASED', 3000, 'INR', ${firmId})
      `;
    } else {
      firmId = existingFirm.id;
      const [hasPaid] = await sql<{ id: string }>`
        select id from payment_ledger where firm_id = ${firmId} and type = 'FIRM_REGISTRATION_FEE' and status = 'RELEASED' limit 1
      `;
      if (!hasPaid) {
        await sql`
          insert into payment_ledger (id, type, status, amount, currency, firm_id)
          values (${crypto.randomUUID()}, 'FIRM_REGISTRATION_FEE', 'RELEASED', 3000, 'INR', ${firmId})
        `;
      }
      await sql`
        update firm_profiles set verified_at = coalesce(verified_at, now()), status = 'APPROVED' where user_id = ${firmId}
      `;
    }

    const [existingProject] = await sql<{ id: string }>`
      select id from projects where customer_id = ${customerId} limit 1
    `;
    if (!existingProject) {
      const project1Id = crypto.randomUUID();
      const project2Id = crypto.randomUUID();
      await sql`
        insert into projects (id, customer_id, firm_id, status, title, description, property_type, carpet_area, rooms, budget_range)
        values
          (${project1Id}, ${customerId}, ${firmId}, 'ACTIVE', 'Modern 3BHK Interior', 'Full home interior with premium materials and smart storage.', 'apartment', 1450, 3, '15-20 lakhs'),
          (${project2Id}, ${customerId}, ${firmId}, 'REQUESTED', '2BHK Renovation', 'Kitchen and living room renovation.', 'apartment', 1100, 2, '8-10 lakhs')
      `;
      const milestone1Id = crypto.randomUUID();
      const milestone2Id = crypto.randomUUID();
      await sql`
        insert into milestones (id, project_id, phase, title, description, amount, status)
        values
          (${milestone1Id}, ${project1Id}, 'Design', 'Concept Design', 'Moodboards, layout options, and material palette.', 65000, 'SUBMITTED'),
          (${milestone2Id}, ${project1Id}, 'Execution', 'Carpentry & finishing', 'Wardrobes, kitchen cabinets, and painting', 350000, 'PENDING')
      `;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes('relation "users" does not exist') || message.includes('relation "payment_ledger" does not exist')) {
      return;
    }
    throw error;
  }
}

export const DEMO_CREDENTIALS = {
  customer: { email: DEMO_CUSTOMER_EMAIL, password: DEMO_CUSTOMER_PASSWORD, name: DEMO_CUSTOMER_NAME },
  firm: { email: DEMO_FIRM_EMAIL, password: DEMO_FIRM_PASSWORD, phone: DEMO_FIRM_PHONE, name: DEMO_FIRM_OWNER },
} as const;
