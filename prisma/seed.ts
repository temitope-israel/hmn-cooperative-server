/// <reference types="node" />
// prisma/seed.ts
// Seeds the database with initial data for development.
// Run with: npm run db:seed

import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient, Role, EmploymentType, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const db = new PrismaClient();

// Helper to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Generates HMN-0001, HMN-0002 etc.
function generateMemberNo(index: number): string {
  return `HMN-${String(index).padStart(4, "0")}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data — order matters because of foreign key constraints.
  // Delete child records before parent records.
  await db.auditLog.deleteMany();
  await db.notification.deleteMany();
  await db.setting.deleteMany();
  await db.approvalRequest.deleteMany();
  await db.member.deleteMany();
  await db.user.deleteMany();

  const password = await hashPassword("Password123!");

  const usersData = [
    {
      email: "admin@hondanigeria.com",
      role: Role.admin,
      fullName: "Adebayo Okafor",
      staffId: "HMN-ADMIN-001",
      employmentType: EmploymentType.regular,
      department: "Management",
      phone: "08012345678",
      bankName: "Guaranty Trust Bank (GTB)",
      accountNo: "0123456789",
    },
    {
      email: "treasurer@hondanigeria.com",
      role: Role.treasurer,
      fullName: "Ngozi Adeyemi",
      staffId: "HMN-TRES-001",
      employmentType: EmploymentType.regular,
      department: "Finance",
      phone: "08023456789",
      bankName: "Zenith Bank",
      accountNo: "0234567890",
    },
    {
      email: "chidi.nwosu@hondanigeria.com",
      role: Role.member,
      fullName: "Chidi Nwosu",
      staffId: "HMN-EMP-008",
      employmentType: EmploymentType.regular,
      department: "Operations",
      phone: "08034567890",
      bankName: "Access Bank",
      accountNo: "0345678901",
    },
    {
      email: "fatima.bello@hondanigeria.com",
      role: Role.member,
      fullName: "Fatima Bello",
      staffId: "HMN-EMP-012",
      employmentType: EmploymentType.regular,
      department: "Finance",
      phone: "08045678901",
      bankName: "First Bank of Nigeria",
      accountNo: "0456789012",
    },
    {
      email: "emeka.eze@hondanigeria.com",
      role: Role.member,
      fullName: "Emeka Eze",
      staffId: "HMN-EMP-005",
      employmentType: EmploymentType.regular,
      department: "Marketing",
      phone: "08056789012",
      bankName: "United Bank for Africa (UBA)",
      accountNo: "0567890123",
    },
    {
      email: "tunde.bakare@hondanigeria.com",
      role: Role.member,
      fullName: "Tunde Bakare",
      staffId: "HMN-CON-019",
      employmentType: EmploymentType.contract,
      department: "Human Resources",
      phone: "08067890123",
      bankName: "Zenith Bank",
      accountNo: "0678901234",
    },
    {
      email: "bisi.adebayo@hondanigeria.com",
      role: Role.member,
      fullName: "Bisi Adebayo",
      staffId: "HMN-CON-023",
      employmentType: EmploymentType.contract,
      department: "Logistics",
      phone: "08078901234",
      bankName: "Stanbic IBTC Bank",
      accountNo: "0789012345",
    },
  ];

  for (let i = 0; i < usersData.length; i++) {
    const data = usersData[i];

    const user = await db.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        role: data.role,
        status: UserStatus.active,
        isActive: true,
      },
    });

    await db.member.create({
      data: {
        userId: user.id,
        memberNo: generateMemberNo(i + 1),
        staffId: data.staffId,
        employmentType: data.employmentType,
        fullName: data.fullName,
        department: data.department,
        phone: data.phone,
        bankName: data.bankName,
        accountNo: data.accountNo,
      },
    });

    console.log(`  ✓ Created ${data.role}: ${data.fullName}`);
  }

  // Default cooperative settings
  const defaultSettings = [
    {
      key: "loan_multiplier_regular",
      value: "2.0",
      label: "Loan multiplier for regular staff (200% of savings)",
    },
    {
      key: "loan_multiplier_contract",
      value: "1.5",
      label: "Loan multiplier for contract staff (150% of savings)",
    },
    {
      key: "interest_rate",
      value: "5.0",
      label: "Annual interest rate on loans (%)",
    },
    {
      key: "savings_interest_rate",
      value: "3.0",
      label: "Annual interest rate on savings (%)",
    },
    {
      key: "min_savings_balance",
      value: "50000",
      label: "Minimum savings balance a member must maintain (₦)",
    },
    {
      key: "monthly_contribution_min",
      value: "10000",
      label: "Minimum monthly contribution amount (₦)",
    },
    {
      key: "dividend_month",
      value: "12",
      label: "Month dividends are paid (1=Jan, 12=Dec)",
    },
    {
      key: "max_loan_duration_months",
      value: "18",
      label: "Maximum loan repayment duration (months)",
    },
  ];

  for (const setting of defaultSettings) {
    await db.setting.create({ data: setting });
    console.log(`  ✓ Setting: ${setting.key} = ${setting.value}`);
  }

  console.log("\n✅ Database seeded successfully!");
  console.log("\nTest accounts (password: Password123!):");
  console.log("  Admin:     admin@hondanigeria.com");
  console.log("  Treasurer: treasurer@hondanigeria.com");
  console.log("  Member:    chidi.nwosu@hondanigeria.com");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });