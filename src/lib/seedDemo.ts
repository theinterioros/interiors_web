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

/** Five projects with name and description; 5 images per project (Unsplash). First three inspired by Mira Kapoor's real projects (Mumbai home, Dhun Wellness, Bandra). */
const PORTFOLIO_WORKS = [
  {
    title: "Mumbai Residence — Worli Duplex",
    description: "Approximately 10,000 sq ft four-bedroom duplex with spaces for life, work, entertainment and play. Designed with Annkur Khosla: distinct zones include a glam room, guest room, home theatre and lounge, DJ space, open-air gym on the deck, pantry and office. Blends practical living with avant-garde touches—sculptural lights, coffee table books, art and tabletop pieces from travels. Custom pieces from Magari, Saba Italia, CC-Tapis; reclaimed wooden totem from Bali. Seamless separation so family can come together while having their own corners.",
  },
  {
    title: "Dhun Wellness — Bandra Sanctuary",
    description: "6,000 sq ft luxury wellness retreat in a quiet Bandra lane, designed with Annkur Khosla. Curved walls and ceilings with no sharp corners for a meditative, cocoon-like feel. Red travertine reception desk (Oorjaa), cementitious textured walls, custom soft furnishings by Bandhini Home. Waiting room with pitched percussion instruments; resonance room for sound immersion and silence. Eastern touch-led practices meet Western tech; space emphasises stillness, resonance and inward listening. Featured in Architectural Digest India.",
  },
  {
    title: "Penthouse Lounge & Entertainment Zone — Mumbai",
    description: "Upstairs section of a family duplex: home theatre, lounge, DJ table, open-air gym on deck, small pantry and office. Design brief was to balance opposing aesthetics—avant-garde and practical—with seamless work-from-home flow. Neutral tones, natural light, and zones that allow the family to gather or retreat. Custom joinery and storage; quality materials chosen for ageing well and easy maintenance. Delivered with full space planning and interior styling.",
  },
  {
    title: "Penthouse — Minimalist Luxury, MG Road",
    description: "3,200 sq ft penthouse with floor-to-ceiling windows and a private terrace. Monochromatic palette with oak and marble, custom lighting, and integrated smart home. Delivered with full turnkey interior and landscaping.",
  },
  {
    title: "Office Interior — Co-working & Reception, HSR",
    description: "8,000 sq ft commercial fit-out: reception, meeting rooms, breakout zones, and open workstations. Brand-aligned colours, acoustic panels, and ergonomic furniture. Completed in 12 weeks with minimal business disruption.",
  },
];
/** 5 images per project; real Unsplash URLs (w=400 for performance). */
const PORTFOLIO_IMAGES_BY_WORK: { name: string; url: string }[][] = [
  [
    { name: "Living area", url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80" },
    { name: "Dining", url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=80" },
    { name: "Home theatre", url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&q=80" },
    { name: "Master bedroom", url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80" },
    { name: "Terrace & gym", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80" },
  ],
  [
    { name: "Reception", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" },
    { name: "Meditation space", url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80" },
    { name: "Resonance room", url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80" },
    { name: "Waiting area", url: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400&q=80" },
    { name: "Curved interior", url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80" },
  ],
  [
    { name: "Lounge", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80" },
    { name: "Home theatre", url: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400&q=80" },
    { name: "Deck", url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80" },
    { name: "Office nook", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80" },
    { name: "Terrace", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" },
  ],
  [
    { name: "Penthouse living", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80" },
    { name: "Dining", url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80" },
    { name: "Terrace view", url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80" },
    { name: "Bedroom", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=80" },
    { name: "Bathroom", url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&q=80" },
  ],
  [
    { name: "Reception", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" },
    { name: "Open office", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80" },
    { name: "Meeting room", url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80" },
    { name: "Breakout zone", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80" },
    { name: "Corridor", url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80" },
  ],
];
/** Dummy portfolio PDF (public sample for demo). */
const PORTFOLIO_PDF_URL = "https://www.africau.edu/images/default/sample.pdf";

/** For existing demo firm: if first 3 portfolio works are old seed data, replace with Mira Kapoor projects so they appear. */
async function ensureMiraKapoorPortfolioContent(profileId: string) {
  try {
    const works = await sql<{ id: string; title: string; display_order: number }>`
      select id, title, display_order from firm_portfolio_works
      where profile_id = ${profileId}
      order by display_order asc
      limit 3
    `;
    if (works.length < 3) return;
    if (works[0].title === "Mumbai Residence — Worli Duplex") return; // already migrated
    for (let i = 0; i < works.length; i++) {
      const work = works[i];
      const data = PORTFOLIO_WORKS[i];
      const images = PORTFOLIO_IMAGES_BY_WORK[i] ?? [];
      await sql`
        update firm_portfolio_works
        set title = ${data.title}, description = ${data.description}, updated_at = now()
        where id = ${work.id}
      `;
      await sql`delete from firm_portfolio_files where work_id = ${work.id}`;
      for (const img of images) {
        await sql`
          insert into firm_portfolio_files (id, profile_id, work_id, blob_url, file_name, mime_type, size_bytes)
          values (${crypto.randomUUID()}, ${profileId}, ${work.id}, ${img.url}, ${img.name}, 'image/png', 0)
        `;
      }
    }
  } catch {
    // tables may not exist or schema may differ
  }
}

async function seedFirmPortfolioAndDoc(profileId: string) {
  try {
    let numWorks = 0;
    try {
      const [workCount] = await sql<{ count: string }>`
        select count(*)::text as count from firm_portfolio_works where profile_id = ${profileId}
      `;
      numWorks = parseInt(workCount?.count ?? "0", 10);
    } catch {
      // firm_portfolio_works table may not exist
    }
    const hasNoWorks = numWorks === 0;

    if (hasNoWorks) {
      // Prefer works + files (so projects show in UI). Only fall back to flat files if works table doesn't exist.
      try {
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
      } catch {
        // Works table may not exist; insert only files (legacy flat structure)
        for (const work of PORTFOLIO_IMAGES_BY_WORK.flat()) {
          await sql`
            insert into firm_portfolio_files (id, profile_id, blob_url, file_name, mime_type, size_bytes)
            values (${crypto.randomUUID()}, ${profileId}, ${work.url}, ${work.name}, 'image/png', 0)
          `;
        }
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

const MAX_PORTFOLIO_WORKS = 5;

/** Keep only the first 5 portfolio works for this profile (by display_order); delete the rest. */
async function capDemoPortfolioWorksAtFive(profileId: string) {
  try {
    await sql`
      delete from firm_portfolio_works
      where profile_id = ${profileId}
      and id not in (
        select id from firm_portfolio_works
        where profile_id = ${profileId}
        order by display_order asc, created_at asc
        limit ${MAX_PORTFOLIO_WORKS}
      )
    `;
  } catch {
    // table may not exist
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
      await ensureMiraKapoorPortfolioContent(profile.id);
      await capDemoPortfolioWorksAtFive(profile.id);
    }

    const [existingProject] = await sql<{ id: string; firm_id: string | null }>`
      select id, firm_id from projects where customer_id = ${customerId} order by created_at desc limit 1
    `;
    let activeProjectId: string;

    if (!existingProject) {
      const project1Id = crypto.randomUUID();
      await sql`
        insert into projects (id, customer_id, firm_id, status, title, description, property_type, carpet_area, rooms, budget_range)
        values (${project1Id}, ${customerId}, ${firmId}, 'ACTIVE', 'Modern 3BHK Interior', 'Full home interior with premium materials and smart storage.', 'apartment', 1450, 3, '15-20 lakhs')
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

    // Demo firm (Mira): remove all leads so the designer sees a clean demo with no random leads
    await sql`delete from projects where firm_id = ${firmId} and status = 'LEAD'`;
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
  firm: { email: DEMO_FIRM_EMAIL_PRIMARY, password: DEMO_FIRM_PASSWORD, phone: DEMO_FIRM_PHONE, name: DEMO_FIRM_OWNER, firmName: DEMO_FIRM_NAME },
} as const;
