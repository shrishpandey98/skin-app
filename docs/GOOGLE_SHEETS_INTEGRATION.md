# Google Sheets Sync Integration Guide

This guide explains how newly created procedures in the Doctor App are synchronized with the **Procedures_Master_Data** spreadsheet (`1W26C7Znao0cKC-smQmmP37D4tNxnhfH-`).

---

## 1. Sheet Mapping Details

Target Spreadsheet: `https://docs.google.com/spreadsheets/d/1W26C7Znao0cKC-smQmmP37D4tNxnhfH-/edit?gid=680012059#gid=680012059`
Target Worksheet: **"New procedures"** (GID: `680012059`)

| Application Field | Google Sheet Column Header | Description |
| :--- | :--- | :--- |
| `name` | **Procedure Name** | Name of the newly created procedure |
| `category` | **Category** | Procedure category (`skin`, `hair`, `laser`, `aesthetics`) |
| `categoryLabel` | **Category Label** | Display category title (e.g. `SKIN`, `LASER`) |
| `addedByClinicId` / `clinicProfileId` | **Clinic Profile ID** | Unique ID of the clinic that created the procedure |
| `addedByClinicName` | **Clinic Name** | Name of the clinic that created the procedure |
| `id` | **ID** | Generated unique identifier (e.g. `proc_custom_172...`) |
| `slug` | **Slug** | URL/Routing slug (e.g. `hydrafacial-elite`) |
| `shortDescription` | **Short Description** | Quick synopsis of the procedure |
| `description` | **Full Description** | Detailed overview (can be filled manually in sheet) |
| `benefits` | **Key Benefits** | Bullet points of procedure benefits |
| `downtime` | **Downtime & Recovery** | Expected recovery timeframe |
| `isActive` | **Active Status** | Current status (`Active` or `Pending Review`) |

---

## 2. Google Apps Script Webhook Code (Optional 1-Click Auto-Append)

To enable automatic instant row insertion when a doctor creates a procedure, paste this script into your Google Sheet:

1. Open the [Google Sheet](https://docs.google.com/spreadsheets/d/1W26C7Znao0cKC-smQmmP37D4tNxnhfH-/edit?gid=680012059#gid=680012059).
2. Go to **Extensions** > **Apps Script**.
3. Replace any code with the following snippet:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("New procedures") || ss.getActiveSheet();

    // Verify or append headers if first row is empty
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 22).getValues()[0];
    if (!headers || headers.length === 0 || !headers[0]) {
      headers = [
        "ID",
        "Sort Order",
        "Procedure Name",
        "Slug",
        "Category",
        "Category Label",
        "Clinic Profile ID",
        "Clinic Name",
        "Short Description",
        "Full Description",
        "Machine/Technology",
        "Common Uses / Indications",
        "Key Benefits",
        "What To Expect",
        "Sessions, Duration & Frequency",
        "Downtime & Recovery",
        "Clinical Considerations & Precautions",
        "FAQs",
        "Related Procedures",
        "Hero Image URL",
        "Added By (Name)",
        "Active Status"
      ];
      sheet.appendRow(headers);
    }

    var newRow = [
      data.id || "proc_" + new Date().getTime(),
      data.sortOrder || 1,
      data.procedureName || "",
      data.slug || "",
      data.category || "skin",
      data.categoryLabel || (data.category ? data.category.toUpperCase() : "SKIN"),
      data.clinicProfileId || "",
      data.clinicName || "",
      data.shortDescription || "",
      data.fullDescription || "",
      data.machineTechnology || "",
      data.commonUses || "",
      data.keyBenefits || "",
      data.whatToExpect || "",
      data.sessionsDurationFrequency || "",
      data.downtimeRecovery || "Zero downtime",
      data.clinicalConsiderations || "",
      data.faqs || "",
      "", // Related Procedures
      data.heroImageUrl || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
      data.addedByName || data.clinicName || "Doctor",
      data.activeStatus || "Active"
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", rowAdded: newRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy** > **New deployment**.
5. Select type **Web app**.
6. Set **Execute as:** `Me` and **Who has access:** `Anyone`.
7. Copy the Web App URL and set it in your `.env` as:
   ```env
   EXPO_PUBLIC_PROCEDURES_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
   ```

---

## 3. Manual Sheet Updates & Live Reflection Flow

1. **Doctor Creates Procedure**: In the Doctor App, a doctor adds a new procedure (e.g. *Hydrafacial MD*, *Laser Carbon Peel*).
2. **Instant Reflection on Clinic Profile**: That procedure appears immediately under **Treatments & Pricing** on that clinic's profile in the customer app.
3. **Clinic Isolation**: The procedure is scoped strictly to that clinic (`addedByClinicId`) and does not appear on other clinic profiles.
4. **Enriching in Google Sheet**: You can open the **"New procedures"** worksheet on Google Sheets and fill in/edit the detailed columns (e.g. *Full Description*, *Machine/Technology*, *FAQs*, *Downtime*).
5. **Customer App Ingestion**: The app pulls updates from the live Google Sheet automatically every 5 minutes (or immediately upon pull-to-refresh) and renders the rich details on the customer app.
