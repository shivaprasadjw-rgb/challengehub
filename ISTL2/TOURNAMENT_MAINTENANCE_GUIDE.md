# Quick Reference: Tournament System Maintenance

## 🚨 Emergency Fix Commands

If tournaments stop working, run these commands in order:

```bash
# 1. Check if Prisma client is working
npx prisma generate

# 2. Clear Next.js cache
Remove-Item -Recurse -Force .next

# 3. Restart server
npm run dev

# 4. Test API
curl http://localhost:3000/api/tournaments
```

## 🔍 Common Issues & Solutions

### Issue: "Cannot find module '.prisma/client/default'"
**Solution**: Run `npx prisma generate`

### Issue: "Tournament not found" warning on tournaments page
**Solution**: Check API endpoint `/api/tournaments` returns data

### Issue: "Cannot read properties of null (reading 'city')"
**Solution**: Add null checks: `tournament.venue ? tournament.venue.city : 'Venue TBD'`

### Issue: Tournament cards not clickable
**Solution**: Check individual tournament API `/api/tournaments/[id]` exists and works

## 📋 Health Check Commands

```bash
# Test tournaments API
curl http://localhost:3000/api/tournaments

# Test individual tournament API
curl http://localhost:3000/api/tournaments/cmezopf6n001aixc0rbqbakb4

# Check server status
curl http://localhost:3000/tournaments
```

## 🛠️ Files to Monitor

- `app/api/tournaments/route.ts` - Main tournaments API
- `app/api/tournaments/[id]/route.ts` - Individual tournament API
- `lib/types.ts` - Type definitions
- `components/TournamentCard.tsx` - Tournament display component
- `app/tournament/[id]/page.tsx` - Tournament detail page

## ⚠️ Critical Points

1. **Never interrupt `npm install`** - Can corrupt Prisma client
2. **Always check null venues** - Many tournaments have null venue data
3. **Type definitions must match API responses** - Prevents runtime errors
4. **Test both API endpoints** - List and individual tournament APIs

## 📊 Expected API Response Format

```json
{
  "success": true,
  "tournaments": [
    {
      "id": "string",
      "name": "string",
      "venue": {
        "city": "string",
        "state": "string"
      } | null,
      "organizer": {
        "name": "string",
        "phone": "string" | null,
        "email": "string" | null
      }
    }
  ]
}
```
