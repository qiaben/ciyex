# Practice Selection Selenium Test

## Prerequisites

1. **Backend running:**
   ```bash
   cd /home/siva/git/ciyex
   SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
   ```

2. **Frontend running:**
   ```bash
   cd /home/siva/git/ciyex/ciyex-ehr-ui
   pnpm dev
   ```

3. **Chrome browser installed**

4. **Python dependencies:**
   ```bash
   cd /home/siva/git/ciyex/scripts
   pip install -r requirements-test.txt
   ```

## Running the Test

```bash
cd /home/siva/git/ciyex/scripts
python3 test_practice_selection.py
```

## What the Test Does

1. ✅ Opens browser and navigates to http://localhost:3000/signin
2. ✅ Clicks "Sign in with Aran" button
3. ✅ Redirects to Keycloak login page
4. ✅ Enters credentials (alice@example.com / Password@123)
5. ✅ Submits login form
6. ✅ Waits for callback processing
7. ✅ Checks localStorage for token and groups
8. ✅ Verifies if redirected to /select-practice or /dashboard
9. ✅ Takes screenshots at each step
10. ✅ Displays browser console logs

## Expected Result

**✅ PASS:** User is redirected to `/select-practice` page showing:
- "Select Practice" heading
- Two practice cards: "Qiaben Health" and "CareWell"
- Select buttons for each practice

**❌ FAIL:** User is redirected to `/dashboard` instead

## Screenshots

Screenshots are saved to `/tmp/`:
- `/tmp/practice_selection_page.png` - Success screenshot
- `/tmp/dashboard_page.png` - Failure screenshot
- `/tmp/signin_error.png` - Signin button error
- `/tmp/login_error.png` - Login form error
- `/tmp/test_error.png` - General test error

## Debugging

If test fails, check:

1. **Backend logs:**
   ```bash
   # Look for errors in backend console
   # Should see request to /api/tenants/accessible
   ```

2. **Frontend logs:**
   ```bash
   # Check browser console in screenshots
   # Should see: "Checking accessible tenants for user..."
   ```

3. **localStorage:**
   ```javascript
   // Test will print localStorage contents
   // Should have: token, groups, selectedTenant
   ```

4. **Manual test:**
   ```bash
   # After test runs, get token from output
   TOKEN='<token-from-test>'
   
   curl -X GET 'http://localhost:8080/api/tenants/accessible' \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' | jq .
   ```

## Test Output Example

### Success:
```
🧪 Testing Practice Selection Flow
============================================================

1️⃣  Navigating to UI...
   ✅ Current URL: http://localhost:3000/signin

2️⃣  Clicking 'Sign in with Aran' button...
   ✅ Redirected to: https://aran-stg.zpoa.com/realms/master/protocol/openid-connect/auth...

3️⃣  Checking Keycloak login page...
   ✅ On Keycloak login page

4️⃣  Entering credentials...
   ✅ Entered email: alice@example.com
   ✅ Entered password
   ✅ Clicked login button

5️⃣  Waiting for redirect after login...
   Current URL: http://localhost:3000/select-practice

6️⃣  Checking localStorage...
   Token: ✅ Present
   Groups: ["/Tenants/CareWell","/Tenants/Qiaben Health"]
   Selected Tenant: ❌ Not set

7️⃣  Checking browser console logs...
   📋 Checking accessible tenants for user...
   📋 Tenants data: {hasFullAccess: false, tenants: Array(2), requiresSelection: true}
   📋 User has multiple tenants, redirecting to practice selection

8️⃣  Verifying current page...
   ✅ SUCCESS! On practice selection page
   📸 Screenshot saved: /tmp/practice_selection_page.png
   ✅ Found 2 practice cards
      - Qiaben Health
      - CareWell

============================================================
✅ TEST PASSED
============================================================
```

### Failure:
```
8️⃣  Verifying current page...
   ❌ FAIL! Redirected to dashboard instead of practice selection
   🔍 This means the practice selection logic is not working
   📸 Screenshot saved: /tmp/dashboard_page.png

9️⃣  Attempting manual navigation to /select-practice...
   ✅ Practice selection page exists and is accessible
   📸 Screenshot saved: /tmp/practice_selection_manual.png

============================================================
❌ TEST FAILED
============================================================
```

## Troubleshooting

### Test hangs at Keycloak login
- Check if Keycloak is accessible: https://aran-stg.zpoa.com
- Verify credentials are correct
- Check network connectivity

### Test fails with "element not found"
- UI might not be running on port 3000
- Check if UI is accessible: http://localhost:3000
- Try running test without headless mode (comment out headless option)

### Backend endpoint returns 404
- Verify backend is running: http://localhost:8080/actuator/health
- Check if TenantController has /api/tenants/accessible endpoint
- Restart backend with correct profile

### Practice selection page doesn't show
- Check callback page implementation
- Verify tenantService.ts exists
- Check browser console logs in screenshots
- Manually test endpoint with curl

## Quick Fix

If you want to force the practice selection page to show:

```javascript
// In browser console after login:
localStorage.removeItem('selectedTenant');
window.location.href = '/select-practice';
```
