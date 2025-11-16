# How to Fix the Point List Page

The point list page (`game-client/src/routes/admin/point/+page.svelte`) currently has some parsing errors from previous edits. Here's how to fix it:

## Option 1: Quick Fix (Recommended)

Restore from git and manually check the Edit buttons:

```bash
cd congress-ingress
git checkout game-client/src/routes/admin/point/+page.svelte
```

Then verify these sections exist:
1. The "Add Point" button should link to `/admin/point/new`
2. Each table row should have "Edit" links to `/admin/point/[id]/edit`

## Option 2: Manual Edit

Find the table row actions section (around line 560-600) and ensure it looks like
```svelte
<td>
  <div class="flex gap-2">
    <a href={`/admin/point/${point.id}`} class="btn btn-ghost btn-xs">
      <!-- View icon -->
      View
    </a>
    <a href={`/admin/point/${point.id}/edit`} class="btn btn-ghost btn-xs">
      <!-- Edit icon -->
      Edit
    </a>
    <button class="btn btn-error btn-xs" onclick={() => handleDeletePoint(point)}>
      <!-- Delete icon -->
      Delete
    </button>
  </div>
</td>
```

## What Was Changed

### Created:
✅ `/admin/point/new` - Dedicated page for creating points
✅ `/admin/point/[pointId]/edit` - Dedicated page for editing points
✅ Enhanced detail page with Edit button

### Removed from list page:
❌ Inline editor form (the card that appeared when clicking Add/Edit)
❌ Form state variables (formName, formType, etc.)
❌ Editor functions (handleAddPoint, handleEditPoint, handleSave)

### Updated in list page:
✔️  "Add Point" button now links to `/admin/point/new`
✔️  "Edit" buttons in rows now link to `/admin/point/[id]/edit`
✔️  "Delete" button still works the same way

## Testing the New System

1. Go to `/admin/point`
2. Click "Add Point" → Should go to new page with form
3. Fill out form and click "Create Point" → Should redirect to detail page
4. Click "Edit" button on detail page → Should go to edit page
5. Make changes and click "Save" → Should return to detail page
6. Go back to `/admin/point` list
7. Click "Edit" on any row → Should go to edit page

All pages are mobile-friendly and use the same styling as before!
