-- Run these queries to identify duplicates before cleaning

-- Find duplicate tournaments (by title and date)
SELECT 
    title, 
    date, 
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ') as duplicate_ids
FROM tournaments 
GROUP BY title, date 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
