# Database Migration Instructions

## Issue: `inventory_category` Type Error

### Problem Description
When editing inventory items and changing their category, you may encounter this error:
```
Error: type "inventory_category" does not exist
```

This error occurs because the database has an old ENUM constraint on the `category` column that restricts it to predefined values only. This prevents you from using custom categories.

### Solution
Run the provided migration script to convert the `category` column from an ENUM type to TEXT type, which allows flexible category values.

---

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Log in to your Supabase project dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and paste the migration**
   - Open the file `supabase-fix-category-enum.sql` from this repository
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the migration**
   - Click the "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for the query to complete
   - You should see "Success. No rows returned"

5. **Verify the fix**
   - Try editing an inventory item and changing its category
   - The error should no longer appear

---

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd /path/to/rankings-inventory

# Run the migration (if you have Supabase CLI configured)
supabase db execute -f supabase-fix-category-enum.sql
```

---

### Option 3: Using psql (Direct PostgreSQL Access)

If you have direct PostgreSQL access:

```bash
psql postgresql://[YOUR_CONNECTION_STRING] -f supabase-fix-category-enum.sql
```

---

## What the Migration Does

1. **Drops dependent views** (`inventory_summary`, `inventory_items_enriched`)
2. **Changes the column type** from ENUM to TEXT in:
   - `inventory_items.category`
   - `activity_log.category` (if it exists)
3. **Drops the ENUM type** `inventory_category`
4. **Recreates the views** with the updated schema

---

## After Running the Migration

Once the migration is complete:

- ✅ You can use any category name (not just predefined ones)
- ✅ You can edit inventory items and change their categories
- ✅ You can add new categories through the UI
- ✅ The predefined categories are still available in the `categories` table

---

## Troubleshooting

### "Permission denied" errors
- Make sure you're logged in as a database owner or admin
- Check your Supabase project permissions

### "View already exists" errors
- The migration should handle this automatically with `DROP VIEW IF EXISTS`
- If it persists, manually drop the views first:
  ```sql
  DROP VIEW IF EXISTS inventory_summary CASCADE;
  DROP VIEW IF EXISTS inventory_items_enriched CASCADE;
  ```

### Still seeing the error after migration
1. Refresh your browser/clear cache
2. Verify the migration completed successfully
3. Check that the `category` column type is now TEXT:
   ```sql
   SELECT table_name, column_name, data_type
   FROM information_schema.columns
   WHERE column_name = 'category' AND table_schema = 'public';
   ```
   Should return `TEXT` not `USER-DEFINED`

---

## Need Help?

If you continue to experience issues after running the migration, please:
1. Check the Supabase logs for any error details
2. Verify your database connection and permissions
3. Contact your database administrator
