# Cache Revalidation Guide

## Problem: PU Test Not Showing in Dropdown

The PU Lahore test is successfully deployed to the database but not visible in the frontend dropdown due to Next.js caching.

## ✅ Database Status (Verified)
- PU test exists: ✅
- PU test is active: ✅  
- PU test in view: ✅
- 1,444 questions imported: ✅

## 🔧 Solution: Clear Next.js Cache

### Quick Fix 1: Restart Dev Server (Recommended)
```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev
```

**Result**: Cache cleared automatically, PU test will appear ✅

---

### Quick Fix 2: API Revalidation

**Step 1**: Make sure dev server is running:
```bash
npm run dev
```

**Step 2**: Call revalidation API:

**PowerShell**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/revalidate" -Method POST -ContentType "application/json" -Body '{"tag":"catalog"}'
```

**curl**:
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tag":"catalog"}'
```

**Browser**: 
Navigate to: `http://localhost:3000/api/revalidate` (GET request shows usage info)

---

### Quick Fix 3: Delete Cache Folder
```bash
cd Taleemkasafar
Remove-Item -Recurse -Force .next
npm run dev
```

Rebuilds entire cache from scratch.

---

## Verification Steps

After revalidation:

1. **Refresh browser** (hard refresh: Ctrl+Shift+R)
2. **Open dropdown**: Dashboard → Test selector
3. **Verify**: Should see both:
   - NET Engineering ✅
   - PU Lahore Entry Test ✅

---

## Why This Happened

Next.js caches API responses for performance. The frontend uses `getEntryTestsCached()` which caches the list of entry tests with the `catalog` tag.

**Location**: `lib/queries/catalog.ts`

```typescript
export const getEntryTestsCached = unstable_cache(
  async (): Promise<EntryTest[]> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("entry_test_public")
      .select("id, slug, name")
      .order("display_order", { ascending: true });
    return data ?? [];
  },
  ["entry-tests-cached"],
  { tags: [CATALOG_TAG] }  // ← Cache is tied to this tag
);
```

When PU test was added to the database, the cache still held the old data (only NET test).

---

## For Future Deployments

After adding new entry tests:

1. **Option A**: Always restart dev server
2. **Option B**: Call revalidation API endpoint:
   ```
   POST /api/revalidate
   Body: { "tag": "catalog" }
   ```
3. **Option C**: Add revalidation to migration script

---

## Production Deployment

For production, you can:

1. **Manual**: Call revalidation API after deployment
2. **Automatic**: Add `revalidateTag(CATALOG_TAG)` to admin actions when creating/editing entry tests
3. **On-Demand ISR**: Set shorter `revalidate` time in cache config (currently 1 hour)

---

## Files Created

- `app/api/revalidate/route.ts` - API endpoint for cache revalidation
- `scripts/revalidate_cache.ts` - CLI script for revalidation

---

## Need Help?

If PU test still doesn't appear after cache revalidation:

1. Check browser console for errors
2. Verify database: `SELECT * FROM entry_test_public;`
3. Check if RLS policies allow anonymous reads on `entry_test_public` view
4. Try incognito/private browsing mode (no browser cache)
