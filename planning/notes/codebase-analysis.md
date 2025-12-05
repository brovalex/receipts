# Codebase Analysis Notes

## Date: 2025-12-05

## Directory Structure

```
receipts/
├── frontend/                 # Next.js application
│   ├── prisma/              # Database schema and migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── api/         # API routes
│   │   │   ├── receipt/     # Receipt detail page
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── page.tsx     # Home page (receipt list)
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities (prisma client)
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
├── services/                # Additional services
│   └── price_scraper/       # Price scraping service (Python)
├── notebooks/               # Jupyter notebooks
├── docker-compose.*.yml     # Docker configurations
└── planning/                # Project planning (new)
```

## Database Models

### Core Models
1. **Receipt** - Main receipt record
   - id, createdAt, updatedAt, reviewed (boolean), receiptDate
   - Has many: expenses, imageFiles

2. **Expense** - Line items on receipts
   - id, priceEach, quantity, receiptId, receiptTextId, productId
   - Belongs to: receipt, product, receiptText

3. **Product** - Product catalog
   - id, name, weight, unitOfMeasure, referenceItemId
   - Belongs to: referenceItem
   - Has many: expenses

4. **ReferenceItem** - Base pricing for tax calculation
   - id, name, quantity, unitOfMeasure, price, pricePerWeight, referenceUrl
   - Has many: products, productPriceProofs

5. **ProductPriceProof** - Price validation records
   - id, name, quantity, unitOfMeasure, price, pricePerWeight, referenceUrl, screenshot, validated
   - Belongs to: referenceItem

### Supporting Models
6. **ImageFile** - Receipt image storage
   - id, url, receiptId
   - Has many: receiptTexts

7. **ReceiptText** - OCR extracted text with bounding boxes
   - id, text, boundingBox, imageFileId
   - Belongs to: imageFile
   - Has one: expense

8. **ProductConversion** - Unit conversion factors
   - id, referenceItemId, fromUnit, toUnit, factor

## Current API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| /api/receipts | GET | List all receipts with expenses |
| /api/receipt/[receiptId] | GET, PUT | Get/update single receipt |
| /api/expense | POST, PUT, DELETE | Manage expenses |
| /api/product | GET, POST | List/create products |
| /api/referenceItem | GET | List reference items |
| /api/price-proofs | GET | List price proofs |
| /api/price-proofs/[id]/validate | PUT | Validate price proof |
| /api/receiptText | GET, PUT | Manage receipt text |
| /api/imageFile | GET | Get image files |

## Current Page Routes

| Route | Description |
|-------|-------------|
| / | Receipt list with year filter |
| /receipt/[receiptId] | Receipt detail with image viewer |
| /admin/price-proofs | Price proof validation admin |

## Key Observations

### Strengths
1. Clean Prisma schema with proper relations
2. Logical separation of concerns
3. Working image/OCR integration
4. Functional CRUD operations

### Areas for Improvement
1. **No authentication** - All routes publicly accessible
2. **No user isolation** - Single tenant
3. **No input validation** - API routes accept any input
4. **Inconsistent error handling** - Try/catch without proper messages
5. **Missing loading states** - Some but not comprehensive
6. **No navigation** - Each page is standalone
7. **Hardcoded values** - Currency formatting, etc.
8. **Limited TypeScript** - Some `any` types remain

### Technical Debt
1. `exp from 'constants'` import in receipt page (unused)
2. Some inline styles mixed with Tailwind
3. Duplicate fetch logic in multiple places
4. No API response caching
5. No rate limiting

## Dependencies Analysis

### Core Dependencies
- `next`: ^14.2.24 - Recent, stable
- `react`: ^18 - Current major version
- `@prisma/client`: ^6.4.1 - Latest
- `flowbite-react`: ^0.10.1 - May have newer versions

### Form Handling
- `react-hook-form`: ^7.52.2 - Good choice
- `react-select`: ^5.8.0 - Standard

### To Add
- `@kinde-oss/kinde-auth-nextjs` - Authentication
- `zod` - Schema validation
- `@tanstack/react-query` - Data fetching (optional)
- `recharts` or `chart.js` - Dashboard charts

## Migration Considerations

### Data Migration for Multi-Tenancy
1. Need default user for existing data
2. All receipts, products, expenses need userId
3. Reference items decision: global vs user-owned
4. Need to handle foreign key constraints

### Environment Variables Needed
```
# Existing
DATABASE_URL=

# New for Kinde
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=
```

## Performance Considerations

1. Receipt list loads all receipts - need pagination
2. No caching strategy
3. Image loading could use lazy loading
4. No database indexes beyond primary keys
