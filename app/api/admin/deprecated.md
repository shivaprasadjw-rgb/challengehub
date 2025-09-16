# DEPRECATED ADMIN API ROUTES

## Status: DEPRECATED ⚠️

**These routes are deprecated and will be removed in a future version.**

All admin functionality has been moved to the unified super-admin system:

### Old Routes → New Routes

- `/api/admin/auth/*` → **Use NextAuth** (`/api/auth/*`)
- `/api/admin/tournaments/*` → `/api/super-admin/analytics/tournaments/`
- `/api/admin/registrations/*` → `/api/super-admin/analytics/stats/`
- `/api/admin/venues/*` → `/api/super-admin/analytics/stats/`

### Migration Instructions

1. **Authentication**: Use NextAuth instead of custom admin auth
2. **Frontend**: Use `/super-admin/*` pages instead of `/admin/*`
3. **APIs**: Use `/api/super-admin/*` endpoints

### Removal Timeline

- **Phase 1**: Mark as deprecated (CURRENT)
- **Phase 2**: Add deprecation warnings to responses
- **Phase 3**: Remove deprecated routes

**All new admin features are built in the `/super-admin` system.**
