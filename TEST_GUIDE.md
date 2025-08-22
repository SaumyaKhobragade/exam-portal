# 🧪 Domain-Based Registration System Testing Guide

## 🚀 Quick Test Setup

### Step 1: Create Test Approved Domain
Let's create a test admin to approve a domain:

```bash
# Open browser to: http://localhost:3000/login
# Use owner credentials or create owner account
```

### Step 2: Test Registration Scenarios

## 📋 Test Scenarios

### ✅ **Scenario 1: Valid Domain Registration**
1. Go to: `http://localhost:3000/login`
2. Click "Create Account" 
3. Fill form with:
   - First Name: `John`
   - Last Name: `Doe`
   - Username: `john_doe`
   - Email: `john@university.edu` (if university.edu is approved)
   - Password: `password123`
4. Expected: ✅ Success popup → Redirect to dashboard

### ❌ **Scenario 2: Invalid Domain Registration**
1. Same steps but use:
   - Email: `john@gmail.com`
2. Expected: ❌ Error popup: "Domain 'gmail.com' is not approved"

### 🔧 **Scenario 3: Create Approved Domain**
1. Login as owner: `http://localhost:3000/login`
2. Go to owner dashboard
3. Create admin with email: `admin@testuniversity.edu`
4. This automatically approves `testuniversity.edu` domain

## 🛠️ Automated Test Script

Run this to set up test data and scenarios:
