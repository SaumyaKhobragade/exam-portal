# 🧪 Manual Testing Guide for Domain-Based Registration

## 🚀 Server Status: ✅ Running on http://localhost:3000

## 📋 Test Data Setup Complete:
- ✅ Owner: `owner@examportal.com` / `owner123`
- ✅ Admin: `admin@testuniversity.edu` / `admin123`
- ✅ Approved Domain: `testuniversity.edu`

---

## 🎯 Test Scenarios

### ✅ **TEST 1: Valid Domain Registration**
1. **Go to**: http://localhost:3000/login
2. **Click**: "Create Account" (Switch to Register tab)
3. **Fill form**:
   - First Name: `John`
   - Last Name: `Student`
   - Username: `johnstudent`
   - Email: `john@testuniversity.edu` ⭐ **Valid domain**
   - Password: `password123`
   - Confirm Password: `password123`
4. **Click**: "Create Account"
5. **Expected Result**: ✅ Success popup → Redirect to user dashboard

---

### ❌ **TEST 2: Invalid Domain (Gmail)**
1. **Go to**: http://localhost:3000/login
2. **Click**: "Create Account"
3. **Fill form**:
   - First Name: `Jane`
   - Last Name: `User`
   - Username: `janeuser`
   - Email: `jane@gmail.com` ⭐ **Invalid domain**
   - Password: `password123`
   - Confirm Password: `password123`
4. **Click**: "Create Account"
5. **Expected Result**: ❌ Error popup: "Domain 'gmail.com' is not approved for registration"

---

### ❌ **TEST 3: Invalid Domain (Random Company)**
1. **Go to**: http://localhost:3000/login
2. **Click**: "Create Account"
3. **Fill form**:
   - First Name: `Bob`
   - Last Name: `Employee`
   - Username: `bobemployee`
   - Email: `bob@randomcompany.com` ⭐ **Invalid domain**
   - Password: `password123`
   - Confirm Password: `password123`
4. **Click**: "Create Account"
5. **Expected Result**: ❌ Error popup: "Domain 'randomcompany.com' is not approved for registration"

---

## 🔧 **TEST 4: Create New Approved Domain**
1. **Login as Owner**:
   - Go to: http://localhost:3000/login
   - Email: `owner@examportal.com`
   - Password: `owner123`

2. **Create Admin** (this approves a new domain):
   - Go to Owner Dashboard
   - Fill admin creation form:
     - Username: `newadmin`
     - Full Name: `New Admin`
     - Email: `admin@newuniversity.org` ⭐ **This will approve newuniversity.org**
     - Organization: `New University`
     - Password: `admin123`
   - Click "Create Admin Account"

3. **Test new domain**:
   - Logout from owner account
   - Try registering with: `student@newuniversity.org`
   - Should now work! ✅

---

## 🎨 **Visual Indicators to Look For**

### Success Registration:
- ✅ Green popup with checkmark
- 🎯 Message: "Welcome! Your [domain] domain registration is approved"
- 🔄 Auto-redirect to user dashboard

### Failed Registration:
- ❌ Red popup with X icon
- 🚫 Message: "Domain '[domain]' is not approved for registration"
- 💡 Buttons: "Try Again" and "Contact Support"
- 🔍 Email field gets focused for correction

---

## 🔍 **Additional Tests**

### Email Format Validation:
- Try invalid emails: `notanemail`, `test@`, `@domain.com`
- Should show HTML5 validation errors

### Password Mismatch:
- Enter different passwords in password fields
- Should show: "Passwords do not match"

### Duplicate Users:
- Try registering same username/email twice
- Should show: "User with email or username already exists"

---

## 🛠️ **Debugging Tips**

### Check Server Console:
- Look for console logs in the terminal running the server
- Domain validation errors will be logged

### Check Browser DevTools:
- Network tab: See API responses
- Console tab: Check for JavaScript errors

### Database Check:
```bash
node test-domain-system.js
```
Shows current approved domains and system status

---

## 📊 **Expected Test Results Summary**

| Email Domain | Should Work | Popup Message |
|-------------|-------------|---------------|
| `testuniversity.edu` | ✅ Yes | Success popup |
| `gmail.com` | ❌ No | Domain not approved |
| `yahoo.com` | ❌ No | Domain not approved |
| `randomcompany.com` | ❌ No | Domain not approved |
| `newuniversity.org` | ✅ Yes (after admin creation) | Success popup |

---

## 🎯 **Quick Test Commands**

```bash
# Check current approved domains
node test-domain-system.js

# Set up fresh test data
node setup-test-data.js

# Start server
node index.js
```

---

## 📞 **If Tests Fail**

1. **Check server is running**: http://localhost:3000 should load
2. **Check database connection**: Look for "Database connected" in console
3. **Verify test data**: Run `node test-domain-system.js`
4. **Clear browser cache**: Try incognito/private mode
5. **Check browser console**: Look for JavaScript errors

**Happy Testing! 🎉**
