# Society Flow Test Plan

## Backend Server Status
- Server should be running on localhost:5000
- All API endpoints should be functional

## Test Cases

### 1. Authentication Flow
- [ ] User can register new account
- [ ] User can login with existing account
- [ ] Token is stored and used for API calls
- [ ] User session persists across app restart

### 2. Society Creation
- [ ] Create Society screen loads properly
- [ ] Form validation works (name length, description length)
- [ ] Privacy toggle functions correctly
- [ ] Icon selection works
- [ ] Society is created in backend database
- [ ] Creator is automatically added as member
- [ ] Success toast shows after creation
- [ ] User is redirected back after creation

### 3. Society Discovery & Browsing
- [ ] SocietiesScreen loads with real data
- [ ] "Discover" tab shows public societies
- [ ] "Joined" tab shows user's societies
- [ ] "You" tab shows created societies
- [ ] Search functionality works
- [ ] Pull to refresh updates data

### 4. Join/Leave Societies
- [ ] Can join public societies
- [ ] Join button updates to "Leave" after joining
- [ ] Member count updates in real-time
- [ ] Can leave joined societies
- [ ] Leave button updates to "Join" after leaving
- [ ] Owner badge shows for created societies
- [ ] Error handling for duplicate joins

### 5. Society Posting
- [ ] PostScreen shows society selection option
- [ ] Society modal opens with joined societies
- [ ] Can select "Post Anonymously" option
- [ ] Can select specific society to post to
- [ ] Submit button text updates based on selection
- [ ] Post is created with correct society_id
- [ ] Post appears in society feed
- [ ] Post appears in main feed if anonymous

### 6. Society Feeds
- [ ] "Confessions" tab shows posts from joined societies
- [ ] Posts show society name
- [ ] Posts are filtered by society membership
- [ ] Real-time updates when new posts are made
- [ ] Empty state shows when no posts

### 7. Error Handling
- [ ] Network errors show appropriate messages
- [ ] Validation errors are displayed
- [ ] Loading states show during API calls
- [ ] Toast notifications for success/error states

### 8. Edge Cases
- [ ] Creating society with duplicate name
- [ ] Joining private societies (should be restricted)
- [ ] Posting to society without being member
- [ ] Leaving society as creator
- [ ] App behavior when offline

## API Endpoints Tested

### Societies
- [ ] GET /api/societies - Get all societies
- [ ] GET /api/societies/discover - Discover societies
- [ ] GET /api/societies/joined - Get joined societies
- [ ] GET /api/societies/you - Get created societies
- [ ] POST /api/societies/join/:id - Join society
- [ ] POST /api/societies/leave - Leave society
- [ ] POST /api/create-society - Create society

### Posts
- [ ] POST /api/post - Create post (with societyId)
- [ ] GET /api/societies/confessions - Get society posts

## Test Data Cleanup
After testing, ensure:
- [ ] Test societies are deleted
- [ ] Test posts are removed
- [ ] Test user accounts are cleaned up

## Performance Tests
- [ ] Society list loads quickly (< 2 seconds)
- [ ] Join/Leave operations are responsive
- [ ] Post creation completes in reasonable time
- [ ] Feed scrolling is smooth

## Accessibility Tests
- [ ] All buttons are accessible
- [ ] Form fields have proper labels
- [ ] Color contrast meets standards
- [ ] Screen reader compatibility

## Security Tests
- [ ] Users can only join public societies
- [ ] Users can only post to joined societies
- [ ] Society creators have proper permissions
- [ ] API endpoints are properly authenticated
