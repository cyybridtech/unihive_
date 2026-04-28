# UniHive Dynamic Ratings Implementation
Status: [ ] 0/11 Complete

## Plan Steps
1. [x] Edit backend/api/getHostels.php – JOIN reviews AVG(rating)
2. [x] Edit src/pages/AdminDashboard.tsx – addHostel(rating:0.0)
3. [x] Create backend/api/reviews.php – POST/GET reviews

4. [x] Edit src/api/api.js – add getReviewsForHostel, submitReview
5. [x] Edit src/pages/HostelDetailsPage.tsx – Review form + API submit
6. [x] Edit src/context/AppContext.tsx – addReview → API + optimistic

7. [x] DB: ALTER hostels DROP COLUMN rating (calculated)
8. [x] Edit src/pages/HomePage.tsx – Dynamic ratings display (already using hostel.rating)
9. [x] Create test reviews script (backend/api/test_reviews.php)
10. [ ] Test: Create hostel → Review → Verify avg rating
11. [ ] Update mockData.ts – Remove static ratings

Current: Step 1
