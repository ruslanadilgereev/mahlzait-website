# Mahlzait Website Live Demo - Testing Guide

## Overview
The live demo section now supports full agent functionality including:
- ✅ Session management (context retention)
- ✅ Meal card rendering with nutrition data
- ✅ Ingredient lists
- ✅ Real-time AI responses

## Prerequisites
- Backend deployed: `https://europe-west1-mytemple-460913.cloudfunctions.net/mahlzait-demo`
- Website built and served (development or production)

## Local Development Testing

### 1. Start Development Server
```bash
cd website_new/mobile-app-landing-template
npm run dev
# or
pnpm dev
```

### 2. Open Browser
Navigate to: `http://localhost:4321` (or your configured port)

Scroll down to the "Live Demo" section.

## Test Scenarios

### Test 1: Basic Text Interaction
**Action:** Type "Hallo, wie geht es dir?" and send

**Expected Result:**
- Message appears in chat as user message
- Loading indicator shows
- AI response appears in assistant bubble
- No meal cards displayed

**Success Criteria:**
- ✅ Messages displayed correctly
- ✅ No console errors
- ✅ Response received within 5 seconds

---

### Test 2: Meal Tracking - Simple
**Action:** Type "Ich habe einen Apfel 150g gegessen" and send

**Expected Result:**
- User message displayed
- AI response with text like "Ich habe deine Mahlzeit erfasst!"
- **Meal card appears** with:
  - 🍽️ Icon
  - Name: "Apfel"
  - Quantity: "150g"
  - Calories: ~78 kcal
  - Macros: P: ~0.4g, C: ~14.1g, F: ~0.3g
  - Green border (success color)

**Success Criteria:**
- ✅ Meal card renders with correct styling
- ✅ Nutrition values displayed
- ✅ No layout issues

---

### Test 3: Meal Tracking - Complex (with Ingredients)
**Action:** Type "Pizza Margherita 300g" and send

**Expected Result:**
- AI response confirms meal tracking
- Meal card shows:
  - Name: "Pizza Margherita"
  - Total macros
  - **Ingredients section** with:
    - Dough (amount + macros)
    - Tomato sauce
    - Mozzarella
    - Etc.

**Success Criteria:**
- ✅ Ingredients list displays
- ✅ Each ingredient shows amount
- ✅ Border separator visible

---

### Test 4: Session Persistence (Context Retention)
**Action:** 
1. Send: "Ich habe Pizza gegessen"
2. Wait for response
3. Send: "Wie viele Kalorien hatte das?"

**Expected Result:**
- Second message should reference the pizza from first message
- Agent remembers context
- Response shows calorie count from tracked pizza

**Success Criteria:**
- ✅ Session ID stored in localStorage (check DevTools > Application > Local Storage)
- ✅ Agent provides contextual answer
- ✅ No "I don't know what you're referring to" response

**Debug:**
Open browser console and check for:
```
Loaded session ID: demo-abc12345-1234567890
New session ID: demo-abc12345-1234567890
```

---

### Test 5: Quick Suggestions
**Action:** Click on one of the pre-defined suggestion buttons

**Expected Result:**
- Input field populated with suggestion text
- Message sent automatically
- Response received with meal card (if applicable)

**Success Criteria:**
- ✅ All three suggestions work
- ✅ Buttons disabled during loading
- ✅ Hover effects work

---

### Test 6: Multiple Meals
**Action:** Type "Ich habe Frühstück gegessen: 2 Eier, 1 Scheibe Brot mit Butter, Kaffee"

**Expected Result:**
- Multiple meal cards appear, OR
- Single meal card with multiple ingredients

**Success Criteria:**
- ✅ All meals/ingredients tracked
- ✅ Cards stack vertically with spacing
- ✅ No overlap issues

---

### Test 7: Rate Limiting (Backend)
**Action:** Send 11+ messages rapidly from same IP

**Expected Result:**
- First 10 messages succeed
- 11th message shows error: "⏱️ Zu viele Anfragen. Bitte versuche es in einer Stunde erneut."

**Success Criteria:**
- ✅ Rate limit enforced
- ✅ User-friendly error message
- ✅ No crashes

---

### Test 8: Session Persistence Across Page Reload
**Action:**
1. Send a meal tracking message
2. Reload the page (F5)
3. Send follow-up: "Wie viel hatte ich schon?"

**Expected Result:**
- Session ID loaded from localStorage
- Agent remembers previous meals
- Provides accurate total

**Debug Console:**
```
Loaded session ID: demo-abc12345-1234567890  <- Should appear on page load
```

---

### Test 9: Error Handling
**Action:** 
1. Turn off internet
2. Try sending a message

**Expected Result:**
- Error message displayed in chat bubble
- User-friendly error (not technical)
- Chat remains functional after reconnecting

**Success Criteria:**
- ✅ No crashes
- ✅ Error message shown
- ✅ Can retry after reconnecting

---

### Test 10: Mobile Responsiveness
**Action:** 
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Test sending messages

**Expected Result:**
- Phone mockup scales correctly
- Messages readable on small screen
- Meal cards don't overflow
- Input field accessible

**Test Devices:**
- iPhone 12 Pro
- Samsung Galaxy S20
- iPad

---

## Visual Verification Checklist

### Message Bubbles
- [ ] User messages: Right-aligned, primary color
- [ ] Assistant messages: Left-aligned, base-200 color
- [ ] Text readable in both light/dark themes

### Meal Cards
- [ ] Green border visible
- [ ] 🍽️ emoji displays
- [ ] Nutrition values aligned properly
- [ ] Ingredients indented with bullets
- [ ] Spacing between multiple meal cards

### Loading States
- [ ] Three dots animate during loading
- [ ] Input disabled during loading
- [ ] Send button disabled during loading

### Overall Layout
- [ ] Phone mockup centered
- [ ] Quick suggestions styled correctly
- [ ] "Live Features" box visible
- [ ] No horizontal scroll

---

## Browser Compatibility Testing

Test in the following browsers:

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome

---

## Performance Testing

### Metrics to Check (Chrome DevTools > Performance)
- Initial load time: < 2s
- Time to interactive: < 3s
- Message send/receive latency: < 2s

### Network Tab
- Verify SSE connection not created (we use simple POST requests)
- Check request payload is correct JSON
- Verify CORS headers present

---

## Console Debugging

Open browser console (F12) and verify:

### Expected Console Logs (Development)
```
Loaded session ID: demo-abc12345-1234567890
New session ID: demo-abc12345-1234567890
```

### No Errors
- [ ] No TypeScript errors
- [ ] No React hydration errors
- [ ] No CORS errors
- [ ] No 500 errors from backend

---

## Troubleshooting

### Issue: Meal cards not displaying
**Check:**
1. Backend response contains `meals` array
2. `meals` array has correct structure
3. React DevTools shows `msg.meals` is populated

**Fix:**
- Verify backend deployed with latest changes
- Check browser console for parsing errors

### Issue: Session not persisting
**Check:**
1. DevTools > Application > Local Storage
2. Look for `demo_session_id` key
3. Verify value matches console logs

**Fix:**
- Clear localStorage and try again
- Check `setSessionId()` is being called

### Issue: Rate limited immediately
**Check:**
- You may have hit the limit during previous testing
- Wait 1 hour or change IP (use mobile hotspot)

**Fix:**
- Backend rate limit resets on cold start
- Redeploy backend to reset counter

### Issue: CORS errors
**Check:**
- Backend returns `Access-Control-Allow-Origin: *` header

**Fix:**
- Verify backend deployed correctly
- Check CORS headers in Network tab

---

## Production Testing

After deploying to production (e.g., Vercel, Netlify):

1. **Live Site URL:** `https://your-domain.com`
2. Navigate to live demo section
3. Run all test scenarios above
4. Verify session persistence works across page navigations
5. Test with real users from different locations/IPs

---

## Success Criteria Summary

All tests should pass with:
- ✅ No console errors
- ✅ Meal cards render correctly
- ✅ Session persists across messages
- ✅ Rate limiting works
- ✅ Mobile responsive
- ✅ All browsers compatible
- ✅ Performance < 3s interactive

---

## Reporting Issues

If you find bugs, provide:
1. Test scenario that failed
2. Browser + OS version
3. Console errors (screenshot)
4. Network tab showing failed reqüst
5. Expected vs actual behavior

