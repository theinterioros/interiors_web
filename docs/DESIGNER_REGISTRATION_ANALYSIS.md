# Designer registration form – analysis and fixes

## Problems identified

### 1. **Unclear structure and flow**
- Account fields (name, email, phone, password), firm details, business details, portfolio, and “about” are mixed in one long form with a two-column layout on desktop.
- Column order (left: Firm + Business; right: Portfolio + About) makes the logical flow hard to follow; on mobile it becomes one column but section order still doesn’t tell a clear “story.”
- No clear sense of steps (e.g. “Step 1: Account → Step 2: Your firm → Step 3: Business…”).

### 2. **Redundancy and confusion**
- **Name asked twice:** “Contact person name” at top (user account) and “Owner / contact name” in firm section. Same person in most cases; no explanation that they can be the same or different (e.g. business contact).
- **Alternate mobile** is optional but not labeled “(optional).”

### 3. **Missing or weak labeling**
- **Pincode:** Only “6 digits” – no example (e.g. 400001); no `inputMode="numeric"` for mobile.
- **Experience (years):** No hint (e.g. “Years in interior design”); no max; backend doesn’t validate range.
- **GST:** Optional but no “(optional)” or format hint (15-character alphanumeric).
- **About your firm:** `minLength={10}` is too low for “at least a few words”; should be ~50+ and placeholder should state minimum.
- **Business type / Ticket size / Designers in team:** Not all marked optional where they are optional.
- **Portfolio:** “You can add more later” is easy to miss; “Skip and add from Profile later” could be clearer.

### 4. **Validation gaps**
- **Backend:** Pincode not validated as 6 digits. Experience years not validated (e.g. ≥ 0). Alternate phone, if provided, not validated as Indian mobile.
- **Frontend:** Pincode has pattern but could use `inputMode="numeric"` and better error message.

### 5. **What the form is “meant” to do**
- Collect **account** (login, contact).
- Collect **firm** (name, location: address, city, pincode) so customers and admin know who and where.
- Collect **business** (type, experience, project size, team size, GST) for credibility and admin review.
- Collect **about** (description) for customer-facing profile.
- **Portfolio** (optional) for showcase; can be added later in Profile.
- **Comments** (optional) for review team.

Logical order: **Account → Your firm → Business → About → Portfolio (optional) → Comments (optional) → Submit.**

## Changes made

1. **Single-column, clear section order**  
   One vertical flow for designer: Account → Your firm → Business → About your work → Portfolio (optional) → Comments (optional) → Submit. Two-column layout removed so the form reads in one clear order on all screen sizes.

2. **Section titles and short intros**  
   Each block has a clear heading and one-line description (e.g. “Where you work”, “How you work”) so the purpose of each part is obvious.

3. **Name and contact clarity**  
   - Top: “Your name” (primary contact for the account).  
   - Firm: “Firm owner or contact name” with placeholder “Same as above or business contact” so duplication is explained.

4. **Consistent “(optional)” labels**  
   All optional fields explicitly marked: Alternate mobile (optional), GST number (optional), Designers in team (optional), Comments (optional). Portfolio section title includes “(optional).”

5. **Better placeholders and hints**  
   - Pincode: “e.g. 400001”, `inputMode="numeric"`.  
   - Experience: “e.g. 5” and hint “Years in interior design”.  
   - About: minimum length increased (e.g. 50 chars), placeholder explains minimum.

6. **Backend validation**  
   - Pincode: must be 6 digits.  
   - Experience years: ≥ 0 (and optionally cap, e.g. ≤ 99).  
   - Alternate phone: if present, must be valid Indian mobile.

7. **Submit button and CTA**  
   Submit copy: “Create designer account”; section order and spacing make the final CTA easy to find after a single scroll.
