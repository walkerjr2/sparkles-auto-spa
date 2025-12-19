# 🚀 Quick Test Commands Reference

## 📋 Fast Command Reference

### **Unit Tests (Fast - 3 seconds)**
```bash
npm test                           # Run all unit tests
npm test -- --watch                # Watch mode (auto-rerun on changes)
npm test -- --coverage             # With coverage report
npm test EmailValidation           # Run specific test file
```

### **E2E Tests (Comprehensive - 1-2 minutes)**
```bash
npm run test:e2e                   # Run all E2E tests (headless)
npm run test:e2e:headed            # Run with visible browser (WATCH IT WORK!)
npm run test:e2e:ui                # Interactive UI mode (best for debugging)
npm run test:e2e:debug             # Step-through debugging
npm run test:report                # View HTML report of last run
```

### **Specific Test Scenarios**
```bash
npx playwright test email-validation                    # Just email tests
npx playwright test --grep "Gmail"                      # Just Gmail tests
npx playwright test --grep "Mobile"                     # Just mobile tests
npx playwright test --project=chromium                  # Just Chrome
npx playwright test --project="Mobile Chrome"           # Just mobile Chrome
npx playwright test --project="iPhone 12"               # Just iPhone
```

### **Quick Workflows**

#### **Development Flow**
```bash
# Terminal 1: Start app
npm start

# Terminal 2: Watch tests
npm test -- --watch
```

#### **Pre-Commit Check**
```bash
npm test -- --watchAll=false && npm run test:e2e
```

#### **Demo for Stakeholders**
```bash
npm run test:e2e:headed
# Shows automated testing in real browser!
```

#### **Debugging Failed Test**
```bash
npm run test:e2e:ui
# Click failed test, see what went wrong
```

---

## 📊 What Each Command Does

| Command | Time | What It Tests | Best For |
|---------|------|---------------|----------|
| `npm test` | 3s | Component logic, functions | Development |
| `npm run test:e2e` | 90s | Full user flow, all browsers | Pre-deployment |
| `npm run test:e2e:headed` | 90s | Same but you can WATCH it | Demos, learning |
| `npm run test:e2e:ui` | - | Interactive exploration | Debugging |
| `npm run test:e2e:debug` | - | Step-by-step execution | Deep debugging |

---

## 🎯 Common Use Cases

### **"I want to see it work"**
```bash
npm run test:e2e:headed
```
Opens Chrome browser, watch automated agent test email validation live!

### **"Did my code break anything?"**
```bash
npm test
```
Fast unit tests, results in 3 seconds.

### **"Test everything before deploying"**
```bash
npm test -- --watchAll=false && npm run test:e2e
```
Runs all 33 tests across all browsers.

### **"Why is this test failing?"**
```bash
npm run test:e2e:ui
```
Interactive UI to debug step-by-step.

### **"Test only on mobile"**
```bash
npx playwright test --project="Mobile Chrome"
```

### **"Generate report for team"**
```bash
npm run test:e2e && npm run test:report
```
Creates HTML report with screenshots and videos.

---

## 🚨 First Time Setup

**Only need to do this once:**
```bash
npm install
npx playwright install
```

Or use the automated script:
```bash
./setup-tests.sh
```

---

## 📱 Mobile Testing

```bash
# Test on Pixel 5 (Android)
npx playwright test --project="Mobile Chrome"

# Test on iPhone 12 (iOS)
npx playwright test --project="Mobile Safari"
```

---

## 🔍 Finding Test Results

After running tests:

- **Screenshots**: `test-results/*/screenshots/`
- **Videos**: `test-results/*/videos/`
- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`

View report:
```bash
npm run test:report
```

---

## ⚡ Speed Tips

### **Run Specific Browser Only**
```bash
npx playwright test --project=chromium  # Fastest
```

### **Run One Test File**
```bash
npx playwright test email-validation
```

### **Run One Test Case**
```bash
npx playwright test --grep "Valid email"
```

### **Parallel Execution**
```bash
npx playwright test --workers=4  # Use 4 CPU cores
```

---

## 🎓 Learning Path

1. **Start Simple**: `npm test` (see unit tests run)
2. **Watch Magic**: `npm run test:e2e:headed` (see browser automation)
3. **Explore**: `npm run test:e2e:ui` (click around, see tests)
4. **Full Suite**: `npm run test:e2e` (run everything)
5. **Add to CI/CD**: Automate on every commit

---

## 💡 Pro Tips

```bash
# Run tests on file save (during development)
npm test -- --watch

# Run and generate coverage report
npm test -- --coverage --watchAll=false

# Debug single test in Chrome DevTools
npm run test:e2e:debug

# Test with specific viewport size
npx playwright test --viewport=375x667  # iPhone SE

# Record new test by recording actions
npx playwright codegen http://localhost:3000
```

---

## 📖 Full Documentation

- **Complete Guide**: `TESTING_GUIDE.md`
- **Feature Docs**: `EMAIL_VALIDATION_FEATURE.md`
- **Setup Complete**: `AUTOMATED_TESTING_COMPLETE.md`

---

## 🎉 Quick Win

**Want to impress someone? Run this:**
```bash
npm run test:e2e:headed
```

They'll see a real browser automatically:
1. Open your website ✅
2. Navigate through booking ✅
3. Test email validation ✅
4. Auto-correct typos ✅
5. Verify everything works ✅

**All in 90 seconds!** 🚀
