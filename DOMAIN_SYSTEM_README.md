# Domain-Based User Registration System

## 🚀 Overview
The exam portal now uses **domain-based validation** instead of organization name checking for user registration. This provides better security and automation.

## 📋 How It Works

### 1. **Domain Approval Process**
When an organization wants to use the exam portal:

1. **Exam Request Submission**: Organization submits exam request with their email
2. **Owner Review**: Owner reviews and approves the request
3. **Automatic Domain Approval**: 
   - Email domain is extracted (e.g., `university.edu` from `admin@university.edu`)
   - Domain is automatically added to approved domains list
   - Admin account is created for the organization

### 2. **User Registration Process**
When a user wants to register:

1. **Email Validation**: System extracts domain from user's email
2. **Domain Check**: Validates if the domain is in approved domains list
3. **Registration**: 
   - ✅ **Approved Domain**: User can register successfully
   - ❌ **Unapproved Domain**: Shows error popup with clear message

## 🔧 Technical Implementation

### **New Models**
```javascript
// ApprovedDomain Model
{
  domain: "university.edu",          // Email domain
  organizationName: "University",   // Organization name
  contactPerson: "John Doe",        // Admin contact
  approvedBy: ObjectId,             // Owner who approved
  adminId: ObjectId,                // Associated admin
  isActive: true                    // Domain status
}
```

### **Updated Models**
```javascript
// User Model - Now stores domain instead of organization
{
  // ... other fields
  domain: "university.edu"  // Extracted from email
}

// Admin Model - Now includes domain field
{
  // ... other fields
  organization: "University Name",
  domain: "university.edu"  // Extracted from email
}
```

### **Validation Logic**
```javascript
// Extract domain from email
const emailDomain = email.split('@')[1];

// Check if domain is approved
const approvedDomain = await ApprovedDomain.findOne({ 
  domain: emailDomain, 
  isActive: true 
});

if (!approvedDomain) {
  throw new ApiError(403, "Domain not approved for registration");
}
```

## 🎯 Benefits

### **Security Improvements**
- **Email-based validation**: More secure than organization name strings
- **Automatic domain extraction**: No manual input errors
- **Domain ownership**: Only users with institutional emails can register

### **User Experience**
- **Simpler registration**: No need to enter organization name
- **Clear error messages**: Users know exactly what went wrong
- **Intuitive process**: Use institutional email = automatic approval

### **Administrative Benefits**
- **Automated approval**: Domains approved when exam requests are accepted
- **Centralized management**: Owner can see all approved domains
- **Audit trail**: Track which domains were approved when and by whom

## 📱 UI Changes

### **Registration Form**
- ❌ **Removed**: Organization name input field
- ✅ **Enhanced**: Email field with helper text
- ✅ **Added**: Domain validation popup messages

### **Error Messages**
```
❌ Old: "Organization not found"
✅ New: "Domain 'gmail.com' is not approved for registration"
```

### **Success Messages**
```
✅ "Welcome! Your university.edu domain registration is approved"
```

## 🧪 Testing Examples

### **Valid Registration Attempts**
```
✅ student@university.edu     (if university.edu is approved)
✅ professor@college.org      (if college.org is approved)
✅ admin@institute.com        (if institute.com is approved)
```

### **Invalid Registration Attempts**
```
❌ user@gmail.com            (Personal email - not approved)
❌ test@yahoo.com            (Personal email - not approved)  
❌ admin@random-org.com      (Organization not in system)
```

## 🔄 Migration Notes

### **Existing Data**
- Existing admins without domains will continue to work
- New admin creation automatically sets domain
- Old organization field preserved for backward compatibility

### **Database Changes**
- New `ApprovedDomain` collection created
- User model updated with `domain` field
- Admin model updated with `domain` field

## 🛠️ API Endpoints

### **New Endpoints**
```
GET /api/v1/owner/approved-domains  // Get all approved domains
```

### **Updated Registration**
```
POST /api/v1/users/register-no-upload
Body: {
  "username": "john_doe",
  "email": "john@university.edu",  // Domain extracted automatically
  "password": "password",
  "fullname": "John Doe"
  // No role field needed
}
```

## 🚀 Future Enhancements

1. **Domain Management UI**: Owner dashboard to manage approved domains
2. **Bulk Domain Import**: CSV upload for multiple domains
3. **Domain Expiry**: Set expiration dates for approved domains
4. **Sub-domain Support**: Allow sub-domains of approved domains
5. **Email Verification**: Verify email ownership before registration

---

## 📞 Support
If users encounter domain validation issues, they should:
1. Verify they're using their institutional email
2. Contact their organization administrator
3. Use the "Contact Support" button in error popups
