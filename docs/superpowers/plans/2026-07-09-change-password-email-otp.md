# Change Password Email OTP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a logged-in Profile change-password flow that requires current password verification, emailed OTP verification, matching new password confirmation, and an atomic password update.

**Architecture:** Keep the current MVC/JWT architecture. Supabase remains the hosted PostgreSQL database through Prisma; do not add Supabase Auth, direct frontend Supabase access, or frontend database calls. Store password-change OTP records in PostgreSQL, send OTP from the backend, and update `User.passwordHash` only after current password, OTP, expiry, attempt, and confirmation checks pass.

**Tech Stack:** Express 5, Prisma 6, PostgreSQL/Supabase Postgres, bcrypt, JWT auth middleware, Node `crypto`, optional `nodemailer` SMTP delivery, React 19, Vite, Astryx Design System, Node `node:test`.

---

## Source Documents

- Project overview and runtime boundaries: `README.md`
- Project agent rules: `AGENTS.md`
- Current auth controller: `backend/src/controllers/auth.controller.js`
- Current auth routes: `backend/src/routes/auth.routes.js`
- Current user model: `backend/src/models/user.model.js`
- Current Prisma schema: `backend/prisma/schema.prisma`
- Current profile view: `frontend/src/views/ProfileView.jsx`
- Current auth API wrapper: `frontend/src/api/authApi.js`
- Existing profile structure test: `frontend/src/views/ProfileView.structure.test.js`

Before editing, run:

```powershell
git status --short
```

Do not overwrite unrelated user work. Read each current file before patching it.

## Required Behavior

The final implementation must satisfy this exact flow:

1. User must already be logged in.
2. User opens `/profile`.
3. Profile page shows a `Change Password` option.
4. User opens the change-password form.
5. User enters current password.
6. User clicks `Send OTP`.
7. Backend verifies current password before creating or sending an OTP.
8. Backend stores only a hashed OTP with expiry and attempt tracking.
9. Backend sends the OTP to the authenticated user's email.
10. OTP input becomes available after successful OTP request.
11. User enters OTP, new password, and new password confirmation.
12. Frontend validates new password and confirmation match before submit.
13. Backend re-verifies current password, verifies OTP, checks expiry/used/attempts, validates new password confirmation, hashes the new password, marks the OTP used, and updates `User.passwordHash` in one Prisma transaction.
14. Any failed step must leave `User.passwordHash` unchanged.

## File Structure

### Backend

- Modify: `backend/package.json`
  - Add `nodemailer` for SMTP email delivery.
- Modify: `backend/.env.example`
  - Add OTP and SMTP configuration placeholders.
- Modify: `backend/prisma/schema.prisma`
  - Add `PasswordChangeOtp` model and relation from `User`.
- Create: `backend/prisma/migrations/20260709000000_add_password_change_otp/migration.sql`
  - Add the database table, foreign key, and indexes.
- Create: `backend/src/models/passwordChangeOtp.model.js`
  - Own OTP persistence, invalidation, attempt increments, and transaction-based password update.
- Create: `backend/src/models/passwordChangeOtp.model.test.js`
  - Structure tests for Prisma operations and no plain OTP storage.
- Create: `backend/src/utils/otp.js`
  - Generate 6-digit OTP, hash OTP, compare OTP, and calculate expiry.
- Create: `backend/src/utils/otp.test.js`
  - Unit tests for OTP shape, hash mismatch, hash match, and expiry.
- Create: `backend/src/services/email.service.js`
  - Send password-change OTP via SMTP when configured, with development console fallback.
- Create: `backend/src/services/email.service.test.js`
  - Structure test for SMTP env usage and no frontend/Supabase Auth dependency.
- Modify: `backend/src/controllers/auth.controller.js`
  - Add `requestPasswordChangeOtp` and `confirmPasswordChange`.
- Modify: `backend/src/controllers/auth.controller.test.js`
  - Add controller tests for old password, OTP request, OTP confirmation, and failed-step no-update behavior.
- Modify: `backend/src/routes/auth.routes.js`
  - Add protected password-change routes.
- Create: `backend/src/routes/auth.routes.structure.test.js`
  - Verify both new routes use `protect` and expected body validation.

### Frontend

- Modify: `frontend/src/api/authApi.js`
  - Add `requestPasswordChangeOtp` and `confirmPasswordChange`.
- Create: `frontend/src/api/authApi.structure.test.js`
  - Verify endpoint paths and no direct Supabase/fetch usage.
- Create: `frontend/src/components/profile/ChangePasswordPanel.jsx`
  - Focused Profile child component for password OTP flow.
- Create: `frontend/src/components/profile/ChangePasswordPanel.structure.test.js`
  - Structure test for current password, OTP, new password, confirmation, disabled states, and API calls.
- Modify: `frontend/src/views/ProfileView.jsx`
  - Import and render `ChangePasswordPanel` inside authenticated profile UI.
- Modify: `frontend/src/views/ProfileView.structure.test.js`
  - Verify Profile includes the password panel and still has no direct Supabase/database access.

### Documentation

- Modify: `README.md`
  - Add backend API endpoints.
  - Add Profile change-password runtime flow.
  - Add `PasswordChangeOtp` to database models.
  - Add OTP/SMTP env variables.
  - Add focused test commands.

---

## Task 1: OTP Persistence Schema

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260709000000_add_password_change_otp/migration.sql`
- Create: `backend/src/models/passwordChangeOtp.model.test.js`
- Create: `backend/src/models/passwordChangeOtp.model.js`

- [ ] **Step 1: Write the failing model structure test**

Create `backend/src/models/passwordChangeOtp.model.test.js`:

```js
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('password change otp model stores only hashed otp and supports invalidation', () => {
  const source = readFileSync(path.join(__dirname, 'passwordChangeOtp.model.js'), 'utf8');

  assert.match(source, /createPasswordChangeOtp/);
  assert.match(source, /invalidateActiveOtps/);
  assert.match(source, /findLatestActiveOtp/);
  assert.match(source, /incrementOtpAttempts/);
  assert.match(source, /completePasswordChange/);
  assert.match(source, /otpHash/);
  assert.doesNotMatch(source, /plainOtp|otpCode|codeText/);
  assert.match(source, /prisma\.\$transaction/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
cd backend
node --test .\src\models\passwordChangeOtp.model.test.js
```

Expected: FAIL because `passwordChangeOtp.model.js` does not exist.

- [ ] **Step 3: Update Prisma schema**

In `backend/prisma/schema.prisma`, add a relation to `User`:

```prisma
model User {
  id                 String              @id @default(uuid())
  username           String
  email              String              @unique
  passwordHash       String              @map("password_hash")
  fullName           String?             @map("full_name")
  phone              String?
  address            String?
  role               Role                @default(customer)
  isBlocked          Boolean             @default(false) @map("is_blocked")
  cart               Cart?
  orders             Order[]
  reviews            Review[]
  passwordChangeOtps PasswordChangeOtp[]
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
}
```

Add the new model near `User`:

```prisma
model PasswordChangeOtp {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  otpHash    String    @map("otp_hash")
  attempts   Int       @default(0)
  expiresAt  DateTime  @map("expires_at")
  usedAt     DateTime? @map("used_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@index([userId, usedAt, expiresAt])
  @@index([createdAt])
}
```

- [ ] **Step 4: Add SQL migration**

Create `backend/prisma/migrations/20260709000000_add_password_change_otp/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "PasswordChangeOtp" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordChangeOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordChangeOtp_user_id_used_at_expires_at_idx" ON "PasswordChangeOtp"("user_id", "used_at", "expires_at");

-- CreateIndex
CREATE INDEX "PasswordChangeOtp_created_at_idx" ON "PasswordChangeOtp"("created_at");

-- AddForeignKey
ALTER TABLE "PasswordChangeOtp" ADD CONSTRAINT "PasswordChangeOtp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

- [ ] **Step 5: Implement OTP model**

Create `backend/src/models/passwordChangeOtp.model.js`:

```js
const prisma = require('../config/database');

const invalidateActiveOtps = async (userId) => {
  return prisma.passwordChangeOtp.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
};

const createPasswordChangeOtp = async ({ userId, otpHash, expiresAt }) => {
  return prisma.$transaction(async (tx) => {
    await tx.passwordChangeOtp.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return tx.passwordChangeOtp.create({
      data: {
        userId,
        otpHash,
        expiresAt,
      },
    });
  });
};

const findLatestActiveOtp = async (userId) => {
  return prisma.passwordChangeOtp.findFirst({
    where: {
      userId,
      usedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const incrementOtpAttempts = async (id) => {
  return prisma.passwordChangeOtp.update({
    where: { id },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });
};

const completePasswordChange = async ({ otpId, userId, passwordHash }) => {
  return prisma.$transaction(async (tx) => {
    const otp = await tx.passwordChangeOtp.findFirst({
      where: {
        id: otpId,
        userId,
        usedAt: null,
      },
    });

    if (!otp) {
      throw new Error('OTP is no longer valid');
    }

    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await tx.passwordChangeOtp.update({
      where: { id: otpId },
      data: { usedAt: new Date() },
    });
  });
};

module.exports = {
  invalidateActiveOtps,
  createPasswordChangeOtp,
  findLatestActiveOtp,
  incrementOtpAttempts,
  completePasswordChange,
};
```

- [ ] **Step 6: Run model test and Prisma validation**

Run:

```powershell
cd backend
node --test .\src\models\passwordChangeOtp.model.test.js
npx prisma validate
```

Expected: both commands pass.

- [ ] **Step 7: Commit Task 1**

```powershell
git add backend/prisma/schema.prisma backend/prisma/migrations/20260709000000_add_password_change_otp/migration.sql backend/src/models/passwordChangeOtp.model.js backend/src/models/passwordChangeOtp.model.test.js
git commit -m "feat: add password change otp persistence"
```

---

## Task 2: OTP Utilities and Email Delivery

**Files:**
- Create: `backend/src/utils/otp.test.js`
- Create: `backend/src/utils/otp.js`
- Modify: `backend/package.json`
- Create: `backend/src/services/email.service.test.js`
- Create: `backend/src/services/email.service.js`
- Modify: `backend/.env.example`

- [ ] **Step 1: Write failing OTP utility tests**

Create `backend/src/utils/otp.test.js`:

```js
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { compareOtp, generateOtp, getOtpExpiry, hashOtp } = require('./otp');

test('generateOtp returns a six digit string', () => {
  const otp = generateOtp();

  assert.match(otp, /^\d{6}$/);
});

test('hashOtp validates matching otp without storing plain text', async () => {
  const hash = await hashOtp('123456');

  assert.notEqual(hash, '123456');
  assert.equal(await compareOtp('123456', hash), true);
  assert.equal(await compareOtp('654321', hash), false);
});

test('getOtpExpiry returns a future date using provided minutes', () => {
  const now = new Date('2026-07-09T00:00:00.000Z');
  const expiry = getOtpExpiry(10, now);

  assert.equal(expiry.toISOString(), '2026-07-09T00:10:00.000Z');
});
```

- [ ] **Step 2: Run OTP utility tests and verify failure**

Run:

```powershell
cd backend
node --test .\src\utils\otp.test.js
```

Expected: FAIL because `backend/src/utils/otp.js` does not exist.

- [ ] **Step 3: Implement OTP utility**

Create `backend/src/utils/otp.js`:

```js
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const OTP_LENGTH = 6;
const DEFAULT_OTP_EXPIRY_MINUTES = 10;

const generateOtp = () => {
  const max = 10 ** OTP_LENGTH;
  return String(crypto.randomInt(0, max)).padStart(OTP_LENGTH, '0');
};

const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
};

const compareOtp = async (otp, otpHash) => {
  return bcrypt.compare(otp, otpHash);
};

const getOtpExpiry = (minutes = DEFAULT_OTP_EXPIRY_MINUTES, now = new Date()) => {
  return new Date(now.getTime() + Number(minutes) * 60 * 1000);
};

module.exports = {
  DEFAULT_OTP_EXPIRY_MINUTES,
  generateOtp,
  hashOtp,
  compareOtp,
  getOtpExpiry,
};
```

- [ ] **Step 4: Run OTP utility tests and verify pass**

Run:

```powershell
cd backend
node --test .\src\utils\otp.test.js
```

Expected: PASS.

- [ ] **Step 5: Add SMTP dependency**

Run:

```powershell
cd backend
npm install nodemailer
```

Expected: `package.json` and `package-lock.json` include `nodemailer`.

- [ ] **Step 6: Write failing email service structure test**

Create `backend/src/services/email.service.test.js`:

```js
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('email service sends password change otp from backend only', () => {
  const source = readFileSync(path.join(__dirname, 'email.service.js'), 'utf8');

  assert.match(source, /sendPasswordChangeOtpEmail/);
  assert.match(source, /nodemailer/);
  assert.match(source, /SMTP_HOST/);
  assert.match(source, /PASSWORD_OTP_DELIVERY_MODE/);
  assert.doesNotMatch(source, /supabase|createClient|fetch\(/i);
});
```

- [ ] **Step 7: Run email service test and verify failure**

Run:

```powershell
cd backend
node --test .\src\services\email.service.test.js
```

Expected: FAIL because `backend/src/services/email.service.js` does not exist.

- [ ] **Step 8: Implement email service**

Create `backend/src/services/email.service.js`:

```js
const nodemailer = require('nodemailer');

const getDeliveryMode = () => process.env.PASSWORD_OTP_DELIVERY_MODE || 'console';

const createSmtpTransport = () => {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
};

const sendPasswordChangeOtpEmail = async ({ to, otp }) => {
  const mode = getDeliveryMode();

  if (mode === 'console') {
    console.info(`Password change OTP for ${to}: ${otp}`);
    return { delivery: 'console' };
  }

  if (mode !== 'smtp') {
    throw new Error('Unsupported password OTP delivery mode');
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    throw new Error('SMTP password OTP delivery is not configured');
  }

  const transporter = createSmtpTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your TechMart password change OTP',
    text: `Your password change OTP is ${otp}. It expires in ${process.env.PASSWORD_OTP_EXPIRES_MINUTES || 10} minutes.`,
  });

  return { delivery: 'smtp' };
};

module.exports = {
  sendPasswordChangeOtpEmail,
};
```

- [ ] **Step 9: Update backend env example**

Append to `backend/.env.example`:

```dotenv
PASSWORD_OTP_EXPIRES_MINUTES=10
PASSWORD_OTP_MAX_ATTEMPTS=5
PASSWORD_OTP_DELIVERY_MODE=console
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@example.com
```

- [ ] **Step 10: Run Task 2 tests**

Run:

```powershell
cd backend
node --test .\src\utils\otp.test.js
node --test .\src\services\email.service.test.js
```

Expected: both pass.

- [ ] **Step 11: Commit Task 2**

```powershell
git add backend/package.json backend/package-lock.json backend/.env.example backend/src/utils/otp.js backend/src/utils/otp.test.js backend/src/services/email.service.js backend/src/services/email.service.test.js
git commit -m "feat: add password otp utilities and delivery"
```

---

## Task 3: Protected Backend Password Change Endpoints

**Files:**
- Modify: `backend/src/controllers/auth.controller.test.js`
- Modify: `backend/src/controllers/auth.controller.js`
- Modify: `backend/src/routes/auth.routes.js`
- Create: `backend/src/routes/auth.routes.structure.test.js`

- [ ] **Step 1: Write failing route structure test**

Create `backend/src/routes/auth.routes.structure.test.js`:

```js
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('password change routes are protected and validate required bodies', () => {
  const source = readFileSync(path.join(__dirname, 'auth.routes.js'), 'utf8');

  assert.match(source, /\/change-password\/request-otp/);
  assert.match(source, /\/change-password\/confirm/);
  assert.match(source, /protect,\s*validateBody\(\['currentPassword'\]\)/);
  assert.match(source, /protect,\s*validateBody\(\['currentPassword', 'otp', 'newPassword', 'confirmPassword'\]\)/);
  assert.match(source, /authController\.requestPasswordChangeOtp/);
  assert.match(source, /authController\.confirmPasswordChange/);
});
```

- [ ] **Step 2: Add failing controller tests**

Append to `backend/src/controllers/auth.controller.test.js`:

```js
const passwordChangeOtpModel = require('../models/passwordChangeOtp.model');
const emailService = require('../services/email.service');

test('requestPasswordChangeOtp rejects unauthenticated users', async () => {
  const controller = require('./auth.controller');
  const response = createResponse();

  await controller.requestPasswordChangeOtp(
    { user: null, body: { currentPassword: 'old123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'User not authenticated');
});

test('requestPasswordChangeOtp verifies current password before creating otp', async () => {
  const controller = require('./auth.controller');
  let created = false;
  const passwordHash = await bcrypt.hash('correct123', 4);

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.createPasswordChangeOtp = async () => {
    created = true;
  };

  const response = createResponse();
  await controller.requestPasswordChangeOtp(
    { user: { id: 'user-1' }, body: { currentPassword: 'wrong123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Current password is incorrect');
  assert.equal(created, false);
});

test('requestPasswordChangeOtp creates and sends otp after current password passes', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('correct123', 4);
  let createdPayload = null;
  let emailPayload = null;

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.createPasswordChangeOtp = async (payload) => {
    createdPayload = payload;
    return { id: 'otp-1' };
  };
  emailService.sendPasswordChangeOtpEmail = async (payload) => {
    emailPayload = payload;
    return { delivery: 'console' };
  };

  const response = createResponse();
  await controller.requestPasswordChangeOtp(
    { user: { id: 'user-1' }, body: { currentPassword: 'correct123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'Password change OTP sent');
  assert.equal(createdPayload.userId, 'user-1');
  assert.match(createdPayload.otpHash, /^\$2/);
  assert.equal(emailPayload.to, 'ada@example.com');
  assert.match(emailPayload.otp, /^\d{6}$/);
});

test('confirmPasswordChange rejects mismatched new password confirmation without updating', async () => {
  const controller = require('./auth.controller');
  let completed = false;

  passwordChangeOtpModel.completePasswordChange = async () => {
    completed = true;
  };

  const response = createResponse();
  await controller.confirmPasswordChange(
    {
      user: { id: 'user-1' },
      body: {
        currentPassword: 'correct123',
        otp: '123456',
        newPassword: 'new12345',
        confirmPassword: 'different123',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'New password and confirmation password must match');
  assert.equal(completed, false);
});

test('confirmPasswordChange rejects invalid otp and does not update password', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('correct123', 4);
  const otpHash = await bcrypt.hash('123456', 4);
  let completed = false;
  let attemptsIncremented = false;

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.findLatestActiveOtp = async () => ({
    id: 'otp-1',
    userId: 'user-1',
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
  });
  passwordChangeOtpModel.incrementOtpAttempts = async () => {
    attemptsIncremented = true;
  };
  passwordChangeOtpModel.completePasswordChange = async () => {
    completed = true;
  };

  const response = createResponse();
  await controller.confirmPasswordChange(
    {
      user: { id: 'user-1' },
      body: {
        currentPassword: 'correct123',
        otp: '000000',
        newPassword: 'new12345',
        confirmPassword: 'new12345',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Invalid OTP');
  assert.equal(attemptsIncremented, true);
  assert.equal(completed, false);
});

test('confirmPasswordChange updates password only after current password and otp pass', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('correct123', 4);
  const otpHash = await bcrypt.hash('123456', 4);
  let completedPayload = null;

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.findLatestActiveOtp = async () => ({
    id: 'otp-1',
    userId: 'user-1',
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
  });
  passwordChangeOtpModel.completePasswordChange = async (payload) => {
    completedPayload = payload;
  };

  const response = createResponse();
  await controller.confirmPasswordChange(
    {
      user: { id: 'user-1' },
      body: {
        currentPassword: 'correct123',
        otp: '123456',
        newPassword: 'new12345',
        confirmPassword: 'new12345',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'Password changed successfully');
  assert.equal(completedPayload.otpId, 'otp-1');
  assert.equal(completedPayload.userId, 'user-1');
  assert.equal(await bcrypt.compare('new12345', completedPayload.passwordHash), true);
});
```

- [ ] **Step 3: Run backend tests and verify failure**

Run:

```powershell
cd backend
node --test .\src\routes\auth.routes.structure.test.js
node --test .\src\controllers\auth.controller.test.js
```

Expected: FAIL because routes and controller methods do not exist.

- [ ] **Step 4: Add controller dependencies**

At the top of `backend/src/controllers/auth.controller.js`, add:

```js
const passwordChangeOtpModel = require('../models/passwordChangeOtp.model');
const emailService = require('../services/email.service');
const { compareOtp, generateOtp, getOtpExpiry, hashOtp } = require('../utils/otp');
```

- [ ] **Step 5: Add shared password-change helpers**

In `backend/src/controllers/auth.controller.js`, before `register`, add:

```js
const getOtpExpiryMinutes = () => Number(process.env.PASSWORD_OTP_EXPIRES_MINUTES || 10);
const getMaxOtpAttempts = () => Number(process.env.PASSWORD_OTP_MAX_ATTEMPTS || 5);

const findAuthenticatedUserWithPassword = async (req, res) => {
  if (!req.user || !req.user.id) {
    errorResponse(res, 401, 'User not authenticated');
    return null;
  }

  const user = await userModel.findById(req.user.id);
  if (!user) {
    errorResponse(res, 404, 'User not found');
    return null;
  }

  if (user.isBlocked) {
    errorResponse(res, 403, 'Your account has been blocked');
    return null;
  }

  return user;
};

const verifyCurrentPassword = async (user, currentPassword) => {
  return bcrypt.compare(currentPassword, user.passwordHash);
};
```

- [ ] **Step 6: Implement OTP request controller**

In `backend/src/controllers/auth.controller.js`, add:

```js
/**
 * Request password-change OTP for authenticated users.
 * POST /api/auth/change-password/request-otp
 */
const requestPasswordChangeOtp = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    const user = await findAuthenticatedUserWithPassword(req, res);
    if (!user) return null;

    const currentPasswordMatches = await verifyCurrentPassword(user, currentPassword);
    if (!currentPasswordMatches) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry(getOtpExpiryMinutes());

    await passwordChangeOtpModel.createPasswordChangeOtp({
      userId: user.id,
      otpHash,
      expiresAt,
    });

    await emailService.sendPasswordChangeOtpEmail({
      to: user.email,
      otp,
    });

    return successResponse(res, 200, 'Password change OTP sent', {
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 7: Implement confirm password-change controller**

In `backend/src/controllers/auth.controller.js`, add:

```js
/**
 * Confirm password change after current password and OTP validation.
 * POST /api/auth/change-password/confirm
 */
const confirmPasswordChange = async (req, res, next) => {
  try {
    const { currentPassword, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'New password and confirmation password must match');
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await findAuthenticatedUserWithPassword(req, res);
    if (!user) return null;

    const currentPasswordMatches = await verifyCurrentPassword(user, currentPassword);
    if (!currentPasswordMatches) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    const otpRecord = await passwordChangeOtpModel.findLatestActiveOtp(user.id);
    if (!otpRecord) {
      return errorResponse(res, 400, 'Password change OTP is required');
    }

    if (otpRecord.usedAt) {
      return errorResponse(res, 400, 'OTP has already been used');
    }

    if (otpRecord.expiresAt.getTime() <= Date.now()) {
      await passwordChangeOtpModel.invalidateActiveOtps(user.id);
      return errorResponse(res, 400, 'OTP has expired');
    }

    if (otpRecord.attempts >= getMaxOtpAttempts()) {
      await passwordChangeOtpModel.invalidateActiveOtps(user.id);
      return errorResponse(res, 400, 'Too many OTP attempts. Request a new OTP');
    }

    const otpMatches = await compareOtp(otp, otpRecord.otpHash);
    if (!otpMatches) {
      await passwordChangeOtpModel.incrementOtpAttempts(otpRecord.id);
      return errorResponse(res, 400, 'Invalid OTP');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await passwordChangeOtpModel.completePasswordChange({
      otpId: otpRecord.id,
      userId: user.id,
      passwordHash,
    });

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 8: Export controller methods**

At the bottom of `backend/src/controllers/auth.controller.js`, update exports:

```js
module.exports = {
  register,
  login,
  getMe,
  requestPasswordChangeOtp,
  confirmPasswordChange,
};
```

- [ ] **Step 9: Add protected routes**

In `backend/src/routes/auth.routes.js`, before `/me`, add:

```js
router.post(
  '/change-password/request-otp',
  protect,
  validateBody(['currentPassword']),
  authController.requestPasswordChangeOtp
);

router.post(
  '/change-password/confirm',
  protect,
  validateBody(['currentPassword', 'otp', 'newPassword', 'confirmPassword']),
  authController.confirmPasswordChange
);
```

- [ ] **Step 10: Run route and controller tests**

Run:

```powershell
cd backend
node --test .\src\routes\auth.routes.structure.test.js
node --test .\src\controllers\auth.controller.test.js
```

Expected: PASS.

- [ ] **Step 11: Commit Task 3**

```powershell
git add backend/src/controllers/auth.controller.js backend/src/controllers/auth.controller.test.js backend/src/routes/auth.routes.js backend/src/routes/auth.routes.structure.test.js
git commit -m "feat: add protected password change endpoints"
```

---

## Task 4: Frontend API and Change Password Panel

**Files:**
- Create: `frontend/src/api/authApi.structure.test.js`
- Modify: `frontend/src/api/authApi.js`
- Create: `frontend/src/components/profile/ChangePasswordPanel.structure.test.js`
- Create: `frontend/src/components/profile/ChangePasswordPanel.jsx`

- [ ] **Step 1: Write failing auth API structure test**

Create `frontend/src/api/authApi.structure.test.js`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const authApiUrl = new URL('./authApi.js', import.meta.url);

test('auth api exposes backend password change otp endpoints only through apiClient', () => {
  const source = readFileSync(authApiUrl, 'utf8');

  assert.match(source, /requestPasswordChangeOtp/);
  assert.match(source, /apiClient\.post\('\/auth\/change-password\/request-otp'/);
  assert.match(source, /confirmPasswordChange/);
  assert.match(source, /apiClient\.post\('\/auth\/change-password\/confirm'/);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});
```

- [ ] **Step 2: Run auth API test and verify failure**

Run:

```powershell
cd frontend
node --test .\src\api\authApi.structure.test.js
```

Expected: FAIL because the API methods do not exist.

- [ ] **Step 3: Add auth API methods**

In `frontend/src/api/authApi.js`, add methods inside `authApi`:

```js
  /**
   * Request an email OTP for an authenticated password change.
   * @param {Object} payload - currentPassword
   * @returns {Promise<Object>} OTP request result
   */
  requestPasswordChangeOtp: (payload) => apiClient.post('/auth/change-password/request-otp', payload),

  /**
   * Confirm an authenticated password change with current password, OTP, and matching new password fields.
   * @param {Object} payload - currentPassword, otp, newPassword, confirmPassword
   * @returns {Promise<Object>} Password change result
   */
  confirmPasswordChange: (payload) => apiClient.post('/auth/change-password/confirm', payload),
```

- [ ] **Step 4: Run auth API test and verify pass**

Run:

```powershell
cd frontend
node --test .\src\api\authApi.structure.test.js
```

Expected: PASS.

- [ ] **Step 5: Write failing ChangePasswordPanel structure test**

Create `frontend/src/components/profile/ChangePasswordPanel.structure.test.js`:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const panelUrl = new URL('./ChangePasswordPanel.jsx', import.meta.url);

test('change password panel implements current password otp and confirmation flow', () => {
  assert.equal(existsSync(panelUrl), true);

  const source = readFileSync(panelUrl, 'utf8');

  assert.match(source, /import \{ authApi \} from '\.\.\/\.\.\/api\/authApi';/);
  assert.match(source, /label="Change Password"/);
  assert.match(source, /label="Current password"/);
  assert.match(source, /type="password"/);
  assert.match(source, /label="Send OTP"/);
  assert.match(source, /authApi\.requestPasswordChangeOtp/);
  assert.match(source, /label="OTP"/);
  assert.match(source, /label="New password"/);
  assert.match(source, /label="Confirm new password"/);
  assert.match(source, /authApi\.confirmPasswordChange/);
  assert.match(source, /New password and confirmation password must match/);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});
```

- [ ] **Step 6: Run panel test and verify failure**

Run:

```powershell
cd frontend
node --test .\src\components\profile\ChangePasswordPanel.structure.test.js
```

Expected: FAIL because `ChangePasswordPanel.jsx` does not exist.

- [ ] **Step 7: Implement ChangePasswordPanel**

Create `frontend/src/components/profile/ChangePasswordPanel.jsx`:

```jsx
import React, { useState } from 'react';
import {
  Button,
  Card,
  FormLayout,
  Heading,
  HStack,
  Text,
  TextInput,
  VStack
} from '@astryxdesign/core';
import { authApi } from '../../api/authApi';
import Alert from '../common/Alert';

const EMPTY_VALUES = {
  currentPassword: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

export const ChangePasswordPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [fieldStatus, setFieldStatus] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldStatus((current) => ({ ...current, [field]: null }));
    setFeedback(null);
  };

  const resetFlow = () => {
    setValues(EMPTY_VALUES);
    setFieldStatus({});
    setFeedback(null);
    setOtpRequested(false);
  };

  const handleSendOtp = async () => {
    if (!values.currentPassword.trim()) {
      setFieldStatus({ currentPassword: { type: 'error', message: 'Current password is required' } });
      return;
    }

    setIsSendingOtp(true);
    setFeedback(null);

    try {
      await authApi.requestPasswordChangeOtp({
        currentPassword: values.currentPassword,
      });
      setOtpRequested(true);
      setFeedback({
        title: 'OTP sent',
        description: 'Check your email for the password change code.',
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to send OTP',
        description: error?.message || 'Current password could not be verified.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const validateSubmit = () => {
    const nextStatus = {};

    if (!values.currentPassword.trim()) {
      nextStatus.currentPassword = { type: 'error', message: 'Current password is required' };
    }
    if (!values.otp.trim()) {
      nextStatus.otp = { type: 'error', message: 'OTP is required' };
    }
    if (values.newPassword.length < 6) {
      nextStatus.newPassword = { type: 'error', message: 'New password must be at least 6 characters long' };
    }
    if (!values.confirmPassword) {
      nextStatus.confirmPassword = { type: 'error', message: 'Confirm new password is required' };
    } else if (values.newPassword !== values.confirmPassword) {
      nextStatus.confirmPassword = {
        type: 'error',
        message: 'New password and confirmation password must match',
      };
    }

    setFieldStatus(nextStatus);
    return Object.keys(nextStatus).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateSubmit()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await authApi.confirmPasswordChange({
        currentPassword: values.currentPassword,
        otp: values.otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      resetFlow();
      setIsOpen(false);
      setFeedback({
        title: 'Password changed',
        description: 'Use your new password the next time you sign in.',
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to change password',
        description: error?.message || 'The password was not changed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={3} justify="between" align="center" wrap="wrap">
          <VStack gap={1}>
            <Heading level={2}>Password</Heading>
            <Text color="secondary">Verify your current password and email OTP before changing it.</Text>
          </VStack>
          <Button
            label={isOpen ? 'Cancel' : 'Change Password'}
            variant={isOpen ? 'secondary' : 'primary'}
            onClick={() => {
              setIsOpen((current) => !current);
              resetFlow();
            }}
            isDisabled={isSendingOtp || isSubmitting}
          />
        </HStack>

        {feedback && <Alert title={feedback.title} description={feedback.description} />}

        {isOpen && (
          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              <FormLayout>
                <TextInput
                  label="Current password"
                  type="password"
                  value={values.currentPassword}
                  onChange={(value) => updateField('currentPassword', value)}
                  status={fieldStatus.currentPassword}
                  isRequired
                  isDisabled={isSendingOtp || isSubmitting}
                  width="100%"
                />
              </FormLayout>

              <HStack gap={2} justify="start" wrap="wrap">
                <Button
                  label="Send OTP"
                  variant="secondary"
                  onClick={handleSendOtp}
                  isLoading={isSendingOtp}
                  isDisabled={isSubmitting}
                />
              </HStack>

              {otpRequested && (
                <FormLayout>
                  <TextInput
                    label="OTP"
                    value={values.otp}
                    onChange={(value) => updateField('otp', value)}
                    status={fieldStatus.otp}
                    isRequired
                    isDisabled={isSubmitting}
                    width="100%"
                  />
                  <TextInput
                    label="New password"
                    type="password"
                    value={values.newPassword}
                    onChange={(value) => updateField('newPassword', value)}
                    status={fieldStatus.newPassword}
                    isRequired
                    isDisabled={isSubmitting}
                    width="100%"
                  />
                  <TextInput
                    label="Confirm new password"
                    type="password"
                    value={values.confirmPassword}
                    onChange={(value) => updateField('confirmPassword', value)}
                    status={fieldStatus.confirmPassword}
                    isRequired
                    isDisabled={isSubmitting}
                    width="100%"
                  />
                </FormLayout>
              )}

              {otpRequested && (
                <HStack gap={2} justify="end" wrap="wrap">
                  <Button
                    label="Reset"
                    variant="secondary"
                    onClick={resetFlow}
                    isDisabled={isSubmitting}
                  />
                  <Button
                    label="Save new password"
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  />
                </HStack>
              )}
            </VStack>
          </form>
        )}
      </VStack>
    </Card>
  );
};

export default ChangePasswordPanel;
```

- [ ] **Step 8: Run frontend tests**

Run:

```powershell
cd frontend
node --test .\src\api\authApi.structure.test.js
node --test .\src\components\profile\ChangePasswordPanel.structure.test.js
```

Expected: PASS.

- [ ] **Step 9: Commit Task 4**

```powershell
git add frontend/src/api/authApi.js frontend/src/api/authApi.structure.test.js frontend/src/components/profile/ChangePasswordPanel.jsx frontend/src/components/profile/ChangePasswordPanel.structure.test.js
git commit -m "feat: add profile password otp panel"
```

---

## Task 5: Wire Password Panel Into Profile

**Files:**
- Modify: `frontend/src/views/ProfileView.structure.test.js`
- Modify: `frontend/src/views/ProfileView.jsx`

- [ ] **Step 1: Update failing Profile structure test**

In `frontend/src/views/ProfileView.structure.test.js`, add these assertions before the `doesNotMatch` assertion:

```js
  assert.match(source, /import ChangePasswordPanel from '\.\.\/components\/profile\/ChangePasswordPanel';/);
  assert.match(source, /<ChangePasswordPanel \/>/);
```

- [ ] **Step 2: Run Profile structure test and verify failure**

Run:

```powershell
cd frontend
node --test .\src\views\ProfileView.structure.test.js
```

Expected: FAIL because `ProfileView.jsx` does not import or render the panel.

- [ ] **Step 3: Import the panel**

In `frontend/src/views/ProfileView.jsx`, add:

```jsx
import ChangePasswordPanel from '../components/profile/ChangePasswordPanel';
```

- [ ] **Step 4: Render the panel inside Profile**

In `frontend/src/views/ProfileView.jsx`, after the existing profile details card/grid block and before the closing root `</VStack>`, add:

```jsx
      <ChangePasswordPanel />
```

- [ ] **Step 5: Run Profile structure test**

Run:

```powershell
cd frontend
node --test .\src\views\ProfileView.structure.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit Task 5**

```powershell
git add frontend/src/views/ProfileView.jsx frontend/src/views/ProfileView.structure.test.js
git commit -m "feat: show change password on profile"
```

---

## Task 6: README Documentation and Full Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README API section**

In `README.md`, under `### Authentication and Users`, add:

```markdown
- `POST /auth/change-password/request-otp` (authenticated)
- `POST /auth/change-password/confirm` (authenticated)
```

- [ ] **Step 2: Update README runtime flows**

In `README.md`, after `### Login Session`, add:

```markdown
### Profile Change Password with Email OTP

1. The authenticated user opens `/profile`.
2. `ProfileView.jsx` renders `ChangePasswordPanel`.
3. The user enters their current password and clicks `Send OTP`.
4. The frontend calls `POST /auth/change-password/request-otp`.
5. `protect` verifies the JWT and blocks unauthenticated or blocked users.
6. `auth.controller.js` reloads the user and verifies the current password with bcrypt.
7. The backend generates a six-digit OTP, stores only the hashed OTP in `PasswordChangeOtp`, invalidates previous active OTPs for the user, and sends the OTP email.
8. The user enters OTP, new password, and new password confirmation.
9. The frontend checks that the new password and confirmation match before submitting.
10. The frontend calls `POST /auth/change-password/confirm`.
11. The backend re-verifies the current password, validates OTP existence, expiry, attempts, and hash match, then updates `User.passwordHash` and marks the OTP used in one Prisma transaction.
12. If any check fails, the backend returns an error and does not update `User.passwordHash`.
```

- [ ] **Step 3: Update README database section**

In the `Primary Prisma models` list, add:

```markdown
- `PasswordChangeOtp`
```

In `Important behavior`, add:

```markdown
- Password changes require a valid logged-in JWT, current password verification, a valid unexpired email OTP, and matching new password confirmation.
- Password-change OTPs are hashed, expire after the configured window, track failed attempts, and are invalidated after use.
```

- [ ] **Step 4: Update README environment variables**

In backend env vars table, add:

```markdown
| `PASSWORD_OTP_EXPIRES_MINUTES` | No | Password-change OTP lifetime. Defaults to `10`. |
| `PASSWORD_OTP_MAX_ATTEMPTS` | No | Maximum failed OTP attempts before invalidation. Defaults to `5`. |
| `PASSWORD_OTP_DELIVERY_MODE` | No | `console` for local development or `smtp` for real email delivery. |
| `SMTP_HOST` | For SMTP | SMTP host for password-change OTP email. |
| `SMTP_PORT` | For SMTP | SMTP port. Defaults to `587`. |
| `SMTP_USER` | For SMTP | SMTP username. |
| `SMTP_PASS` | For SMTP | SMTP password. |
| `SMTP_FROM` | For SMTP | Sender address for OTP emails. |
```

- [ ] **Step 5: Update README testing commands**

In `Testing and Validation`, add:

```markdown
Password-change backend tests:

```powershell
cd backend
node --test .\src\utils\otp.test.js
node --test .\src\services\email.service.test.js
node --test .\src\models\passwordChangeOtp.model.test.js
node --test .\src\routes\auth.routes.structure.test.js
node --test .\src\controllers\auth.controller.test.js
```

Password-change frontend tests:

```powershell
cd frontend
node --test .\src\api\authApi.structure.test.js
node --test .\src\components\profile\ChangePasswordPanel.structure.test.js
node --test .\src\views\ProfileView.structure.test.js
```
```

- [ ] **Step 6: Run focused backend verification**

Run:

```powershell
cd backend
npx prisma validate
node --test .\src\utils\otp.test.js
node --test .\src\services\email.service.test.js
node --test .\src\models\passwordChangeOtp.model.test.js
node --test .\src\routes\auth.routes.structure.test.js
node --test .\src\controllers\auth.controller.test.js
```

Expected: PASS.

- [ ] **Step 7: Run focused frontend verification**

Run:

```powershell
cd frontend
node --test .\src\api\authApi.structure.test.js
node --test .\src\components\profile\ChangePasswordPanel.structure.test.js
node --test .\src\views\ProfileView.structure.test.js
npm run build
```

Expected: PASS.

- [ ] **Step 8: Run all documented tests**

Run:

```powershell
cd backend
Get-ChildItem .\src, .\prisma -Recurse -Filter *.test.js | ForEach-Object { node --test $_.FullName }
```

Expected: all backend tests pass.

Run:

```powershell
cd frontend
Get-ChildItem .\src -Recurse -Filter *.test.js | ForEach-Object { node --test $_.FullName }
npm run lint
npm run build
```

Expected: all frontend tests pass, lint passes, build passes.

- [ ] **Step 9: Commit Task 6**

```powershell
git add README.md
git commit -m "docs: document password change otp flow"
```

---

## Acceptance Checklist

- [ ] `/profile` remains protected by `PrivateRoute`.
- [ ] Backend password-change routes use `protect`.
- [ ] No frontend code imports Supabase, Prisma, SQL, or database env vars.
- [ ] No Supabase Auth is introduced.
- [ ] OTP is generated on the backend.
- [ ] OTP is hashed before persistence.
- [ ] Previous active OTPs are invalidated when a new OTP is requested.
- [ ] Current password is verified before OTP creation.
- [ ] Current password is verified again before password update.
- [ ] OTP expiry is enforced.
- [ ] OTP failed attempts are tracked and capped.
- [ ] Used OTP cannot be reused.
- [ ] New password and confirmation must match on frontend and backend.
- [ ] `User.passwordHash` changes only inside `completePasswordChange`.
- [ ] `completePasswordChange` updates password and invalidates OTP in one Prisma transaction.
- [ ] README documents routes, flow, env vars, database model, and tests.

## Self-Review

- Spec coverage: all requested frontend, backend, API route, validation, authentication, OTP handling, database update, error-message, and README requirements are assigned to tasks.
- Placeholder scan: no unresolved placeholder markers are present.
- Type consistency: endpoint names are consistently `/auth/change-password/request-otp` and `/auth/change-password/confirm`; payload names are consistently `currentPassword`, `otp`, `newPassword`, and `confirmPassword`.
