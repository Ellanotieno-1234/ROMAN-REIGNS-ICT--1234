# Data Import Navigation Fix

## Current Issue
After successful data upload, the application attempts to redirect to `/admin/analysis` which doesn't exist. Instead, it should switch to the Analysis tab within the AdminPortal component.

## Required Changes

1. Update DataImport.tsx:
- Remove `window.location.href = '/admin/analysis'` redirects
- Add a prop for tab state management:
```typescript
interface DataImportProps {
  onUploadComplete?: () => void;
}
```
- Call onUploadComplete after successful upload

2. Update AdminPortal.tsx:
- Pass onUploadComplete handler to DataImport:
```typescript
<DataImport onUploadComplete={() => setActiveTab('dashboard')} />
```

3. Expected Behavior:
- After successful upload, user stays on the same page
- View switches to dashboard tab where they can see the analytics visualizations
- No page reload or navigation occurs

## Implementation Plan
1. Switch to Code mode
2. Update DataImport component to accept new prop
3. Modify success handlers to use the callback
4. Update AdminPortal to pass the handler
5. Test the data upload flow

## Success Criteria
- Successful uploads keep user in the admin portal
- Analytics data immediately visible in dashboard
- Smooth transition between views without page reload