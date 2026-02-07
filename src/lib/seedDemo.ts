import crypto from "crypto";
import { hashPassword } from "@/lib/password";
import { sql } from "@/lib/db";

/** Demo credentials — aligned with DEMO.md. Password: Demo123! */
const DEMO_CUSTOMER_EMAIL = "customer@interioros.com";
const DEMO_CUSTOMER_PASSWORD = "Demo123!";
const DEMO_CUSTOMER_NAME = "Aarav Sharma";

/** Demo firm email: firm@interioros.com. Fallback: firm@interiors.com if that account exists. */
const DEMO_FIRM_EMAIL_PRIMARY = "firm@interioros.com";
const DEMO_FIRM_EMAIL_FALLBACK = "firm@interiors.com";
const DEMO_FIRM_PASSWORD = "Demo123!";
const DEMO_FIRM_PHONE = "9876543211";
const DEMO_FIRM_NAME = "Studio Nirmaan";
const DEMO_FIRM_OWNER = "Mira Kapoor";
const DEMO_FIRM_ADDRESS = "12th Main, Indiranagar, Bengaluru 560038";
const DEMO_FIRM_CITY = "Bengaluru";
const DEMO_FIRM_PINCODE = "560038";
const DEMO_FIRM_ABOUT =
  "Studio Nirmaan is led by Mira Kapoor, with over 8 years of experience in residential and commercial interiors across South India. We specialise in modern Indian aesthetics—clean lines, natural materials, and thoughtful space planning. From concept to handover, we deliver full-service interiors: 3D visualisation, material sourcing, and site supervision. Our projects range from compact apartments to large villas; we work closely with clients to reflect their lifestyle and budget. Certified in sustainable design practices; happy to share references and portfolio on request.";
const DEMO_FIRM_GOOGLE_REVIEW =
  "https://www.google.com/search?q=Studio+Nirmaan+reviews";
const DEMO_FIRM_BUSINESS_TYPE = "Both";
const DEMO_FIRM_TICKET_SIZE = "15-20 lakhs";
const DEMO_FIRM_DESIGNERS_COUNT = 4;
const DEMO_FIRM_GST = "29AABCT1234A1Z5";

const PORTFOLIO_WORKS = [
  {
    title: "Heritage Home — Full Interior, Koramangala",
    description: "1,800 sq ft apartment: living, dining, three bedrooms, and pooja room. Warm wood and stone finishes, custom joinery, and concealed storage. Client wanted a blend of traditional and contemporary; we used teak and Indian marble with a neutral palette.",
  },
  {
    title: "Compact 2BHK — Smart Space, Whitefield",
    description: "1,100 sq ft apartment with open kitchen and living, two bedrooms, and study nook. Space-saving solutions, modular kitchen with breakfast counter, and built-in wardrobes. Delivered within 4 months.",
  },
  {
    title: "Villa Interior — Common Areas & Master Suite, Yemalur",
    description: "Ground and first floor common areas plus master bedroom and wardrobe. Large-format tiles, false ceiling with cove lighting, and custom furniture. Project included material sourcing and site coordination with the builder.",
  },
];
const PORTFOLIO_IMAGES_BY_WORK: { name: string; url: string }[][] = [
  [
    { name: "Living area", url: "https://placehold.co/600x400/e2e8f0/64748b?text=Living+Area" },
    { name: "Dining detail", url: "https://placehold.co/600x400/cbd5e1/475569?text=Dining" },
    { name: "Pooja room", url: "https://placehold.co/600x400/f1f5f9/334155?text=Pooja+Room" },
  ],
  [
    { name: "Open kitchen", url: "https://placehold.co/600x400/e2e8f0/64748b?text=Kitchen" },
    { name: "Bedroom", url: "https://placehold.co/600x400/cbd5e1/475569?text=Bedroom" },
    { name: "Study nook", url: "https://placehold.co/600x400/f1f5f9/334155?text=Study" },
  ],
  [
    { name: "Villa living", url: "https://placehold.co/600x400/e2e8f0/64748b?text=Villa+Living" },
    { name: "Master suite", url: "https://placehold.co/600x400/cbd5e1/475569?text=Master+Suite" },
    { name: "Wardrobe detail", url: "https://placehold.co/600x400/f1f5f9/334155?text=Wardrobe" },
  ],
];
/** Dummy portfolio PDF (public sample for demo). */
const PORTFOLIO_PDF_URL = "https://www.africau.edu/images/default/sample.pdf";

async function seedFirmPortfolioAndDoc(profileId: string) {
  try {
    let useWorks = false;
    try {
      const [row] = await sql<{ id: string }>`select id from firm_portfolio_works limit 1`;
      useWorks = !!row;
    } catch {
      // firm_portfolio_works table may not exist
    }

    let numWorks = 0;
    try {
      const [workCount] = await sql<{ count: string }>`
        select count(*)::text as count from firm_portfolio_works where profile_id = ${profileId}
      `;
      numWorks = parseInt(workCount?.count ?? "0", 10);
    } catch {
      // firm_portfolio_works may not exist
    }
    const hasNoWorks = numWorks === 0;

    if (hasNoWorks && useWorks) {
      for (let i = 0; i < PORTFOLIO_WORKS.length; i++) {
        const workId = crypto.randomUUID();
        await sql`
          insert into firm_portfolio_works (id, profile_id, title, description, display_order)
          values (${workId}, ${profileId}, ${PORTFOLIO_WORKS[i].title}, ${PORTFOLIO_WORKS[i].description}, ${i})
        `;
        const images = PORTFOLIO_IMAGES_BY_WORK[i] ?? [];
        for (const img of images) {
          await sql`
            insert into firm_portfolio_files (id, profile_id, work_id, blob_url, file_name, mime_type, size_bytes)
            values (${crypto.randomUUID()}, ${profileId}, ${workId}, ${img.url}, ${img.name}, 'image/png', 0)
          `;
        }
      }
    } else if (hasNoWorks) {
      for (const work of PORTFOLIO_IMAGES_BY_WORK.flat()) {
        await sql`
          insert into firm_portfolio_files (id, profile_id, blob_url, file_name, mime_type, size_bytes)
          values (${crypto.randomUUID()}, ${profileId}, ${work.url}, ${work.name}, 'image/png', 0)
        `;
      }
    }
  } catch {
    // firm_portfolio_works or firm_portfolio_files may not exist (e.g. older DB); skip portfolio works/files
  }

  try {
    const [docExists] = await sql<{ id: string }>`
      select id from firm_documents where profile_id = ${profileId} and doc_type = 'portfolio' limit 1
    `;
    if (!docExists) {
      await sql`
        insert into firm_documents (id, profile_id, doc_type, blob_url, file_name, mime_type, size_bytes)
        values (${crypto.randomUUID()}, ${profileId}, 'portfolio', ${PORTFOLIO_PDF_URL}, 'Studio_Nirmaan_Portfolio.pdf', 'application/pdf', 0)
      `;
    }
  } catch {
    // firm_documents may not exist
  }
}

export async function ensureDemoAccounts() {
  try {
    const [existingCustomer] = await sql<{ id: string }>`
      select id from users where email = ${DEMO_CUSTOMER_EMAIL} limit 1
    `;
    const [existingFirm] = await sql<{ id: string }>`
      select id from users where email = ${DEMO_FIRM_EMAIL_PRIMARY} or email = ${DEMO_FIRM_EMAIL_FALLBACK} limit 1
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
        values (${firmId}, ${DEMO_FIRM_EMAIL_PRIMARY}, ${DEMO_FIRM_PHONE}, ${passwordHash}, 'FIRM', ${DEMO_FIRM_OWNER})
      `;
      const profileId = crypto.randomUUID();
      await sql`
        insert into firm_profiles (
          id, user_id, firm_name, owner_name, office_address, gst, business_type, ticket_size, designers_count,
          name, experience_years, city, pincode, about, status, verified_at,
          google_review_links, rating, platform_margin_pct, margin_accepted_at
        )
        values (
          ${profileId},
          ${firmId},
          ${DEMO_FIRM_NAME},
          ${DEMO_FIRM_OWNER},
          ${DEMO_FIRM_ADDRESS},
          ${DEMO_FIRM_GST},
          ${DEMO_FIRM_BUSINESS_TYPE},
          ${DEMO_FIRM_TICKET_SIZE},
          ${DEMO_FIRM_DESIGNERS_COUNT},
          ${DEMO_FIRM_OWNER},
          8,
          ${DEMO_FIRM_CITY},
          ${DEMO_FIRM_PINCODE},
          ${DEMO_FIRM_ABOUT},
          'APPROVED',
          now(),
          ${DEMO_FIRM_GOOGLE_REVIEW},
          4.8,
          10,
          now()
        )
      `;
      await sql`
        insert into payment_ledger (id, type, status, amount, currency, firm_id)
        values (${crypto.randomUUID()}, 'FIRM_REGISTRATION_FEE', 'RELEASED', 3000, 'INR', ${firmId})
      `;
      try {
        await sql`
          update firm_profiles set subscription_expires_at = now() + interval '1 year' where user_id = ${firmId}
        `;
      } catch {
        // subscription_expires_at column may not exist before migration
      }
      await seedFirmPortfolioAndDoc(profileId);
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
      try {
        await sql`
          update firm_profiles set subscription_expires_at = now() + interval '1 year'
          where user_id = ${firmId} and (subscription_expires_at is null or subscription_expires_at < now())
        `;
      } catch {
        // subscription_expires_at column may not exist before migration
      }
      let [profile] = await sql<{ id: string }>`
        select id from firm_profiles where user_id = ${firmId} limit 1
      `;
      if (!profile) {
        const profileId = crypto.randomUUID();
        await sql`
          insert into firm_profiles (
            id, user_id, firm_name, owner_name, office_address, gst, business_type, ticket_size, designers_count,
            name, experience_years, city, pincode, about, status, verified_at,
            google_review_links, rating, platform_margin_pct, margin_accepted_at
          )
          values (
            ${profileId},
            ${firmId},
            ${DEMO_FIRM_NAME},
            ${DEMO_FIRM_OWNER},
            ${DEMO_FIRM_ADDRESS},
            ${DEMO_FIRM_GST},
            ${DEMO_FIRM_BUSINESS_TYPE},
            ${DEMO_FIRM_TICKET_SIZE},
            ${DEMO_FIRM_DESIGNERS_COUNT},
            ${DEMO_FIRM_OWNER},
            8,
            ${DEMO_FIRM_CITY},
            ${DEMO_FIRM_PINCODE},
            ${DEMO_FIRM_ABOUT},
            'APPROVED',
            now(),
            ${DEMO_FIRM_GOOGLE_REVIEW},
            4.8,
            10,
            now()
          )
        `;
        profile = { id: profileId };
      } else {
        await sql`
          update firm_profiles set
            verified_at = coalesce(verified_at, now()),
            status = 'APPROVED',
            firm_name = coalesce(firm_name, ${DEMO_FIRM_NAME}),
            owner_name = coalesce(owner_name, ${DEMO_FIRM_OWNER}),
            office_address = coalesce(office_address, ${DEMO_FIRM_ADDRESS}),
            about = coalesce(nullif(trim(about), ''), ${DEMO_FIRM_ABOUT}),
            city = coalesce(city, ${DEMO_FIRM_CITY}),
            pincode = coalesce(pincode, ${DEMO_FIRM_PINCODE}),
            experience_years = coalesce(experience_years, 8),
            business_type = coalesce(business_type, ${DEMO_FIRM_BUSINESS_TYPE}),
            ticket_size = coalesce(ticket_size, ${DEMO_FIRM_TICKET_SIZE}),
            designers_count = coalesce(designers_count, ${DEMO_FIRM_DESIGNERS_COUNT}),
            google_review_links = coalesce(google_review_links, ${DEMO_FIRM_GOOGLE_REVIEW}),
            rating = coalesce(rating, 4.8),
            platform_margin_pct = coalesce(platform_margin_pct, 10),
            margin_accepted_at = now()
          where user_id = ${firmId}
        `;
      }
      await seedFirmPortfolioAndDoc(profile.id);
    }

    const [existingProject] = await sql<{ id: string; firm_id: string | null }>`
      select id, firm_id from projects where customer_id = ${customerId} order by created_at desc limit 1
    `;
    let activeProjectId: string;

    if (!existingProject) {
      const project1Id = crypto.randomUUID();
      const project2Id = crypto.randomUUID();
      await sql`
        insert into projects (id, customer_id, firm_id, status, title, description, property_type, carpet_area, rooms, budget_range)
        values
          (${project1Id}, ${customerId}, ${firmId}, 'ACTIVE', 'Modern 3BHK Interior', 'Full home interior with premium materials and smart storage.', 'apartment', 1450, 3, '15-20 lakhs'),
          (${project2Id}, ${customerId}, ${firmId}, 'LEAD', '2BHK Renovation', 'Kitchen and living room renovation. Customer requested meetup.', 'apartment', 1100, 2, '8-10 lakhs')
      `;
      activeProjectId = project1Id;
      const milestone1Id = crypto.randomUUID();
      const milestone2Id = crypto.randomUUID();
      await sql`
        insert into milestones (id, project_id, phase, title, description, amount, status)
        values
          (${milestone1Id}, ${project1Id}, 'Design', 'Concept Design', 'Moodboards, layout options, and material palette.', 65000, 'SUBMITTED'),
          (${milestone2Id}, ${project1Id}, 'Execution', 'Carpentry & finishing', 'Wardrobes, kitchen cabinets, and painting', 350000, 'PENDING')
      `;
      await sql`
        insert into payment_ledger (id, type, status, amount, currency, customer_id, project_id, milestone_id)
        values (${crypto.randomUUID()}, 'MILESTONE', 'RELEASED', 65000, 'INR', ${customerId}, ${project1Id}, ${milestone1Id})
      `;
    } else {
      activeProjectId = existingProject.id;
      if (existingProject.firm_id !== firmId) {
        await sql`update projects set firm_id = ${firmId} where id = ${existingProject.id}`;
      }
      const [milestoneCount] = await sql<{ count: number }>`
        select count(*)::int as count from milestones where project_id = ${existingProject.id}
      `;
      if (milestoneCount.count === 0) {
        const milestone1Id = crypto.randomUUID();
        const milestone2Id = crypto.randomUUID();
        await sql`
          insert into milestones (id, project_id, phase, title, description, amount, status)
          values
            (${milestone1Id}, ${activeProjectId}, 'Design', 'Concept Design', 'Moodboards, layout options, and material palette.', 65000, 'SUBMITTED'),
            (${milestone2Id}, ${activeProjectId}, 'Execution', 'Carpentry & finishing', 'Wardrobes, kitchen cabinets, and painting', 350000, 'PENDING')
        `;
        await sql`
          insert into payment_ledger (id, type, status, amount, currency, customer_id, project_id, milestone_id)
          values (${crypto.randomUUID()}, 'MILESTONE', 'RELEASED', 65000, 'INR', ${customerId}, ${activeProjectId}, ${milestone1Id})
        `;
      }
      await sql`
        update projects set status = 'LEAD' where customer_id = ${customerId} and firm_id = ${firmId} and status = 'REQUESTED'
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
  firm: { email: DEMO_FIRM_EMAIL_PRIMARY, password: DEMO_FIRM_PASSWORD, phone: DEMO_FIRM_PHONE, name: DEMO_FIRM_OWNER },
} as const;
