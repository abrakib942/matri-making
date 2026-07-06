import { PrismaClient } from '@prisma/client';
import { HashService } from '../../src/util/hash.service';

const hash = new HashService();

type DemoSpec = {
  email: string;
  name: string;
  mode: 'ISLAMIC' | 'GENERAL';
  gender: 'MALE' | 'FEMALE';
  divisionName: string;
  districtName: string;
  professionKey: string;
  educationLevel: 'BACHELORS' | 'MASTERS' | 'HSC' | 'MADRASA_QAWMI';
  dob: string;
  islamic?: {
    prayerFrequency: 'FIVE_TIMES_DAILY' | 'MOSTLY' | 'SOMETIMES';
    hijabStyle?: 'NIQAB_WITH_ABAYA' | 'HIJAB_WITH_ABAYA' | 'HIJAB_ONLY' | 'NONE';
    beardStyle?: 'FULL_SUNNAH' | 'TRIMMED' | 'NONE';
    aqidah?: 'AHLE_SUNNAH_WAL_JAMAAH' | 'SALAFI';
    madhhab?: 'HANAFI' | 'SHAFII';
    viewsOnLoans?: 'AVOID' | 'NECESSARY_ONLY' | 'FLEXIBLE';
    waliName?: string;
    waliPhone?: string;
  };
  general?: {
    smoking: 'NEVER' | 'OCCASIONALLY';
    drinking: 'NEVER';
    diet: 'HALAL_ONLY';
  };
};

const DEMOS: DemoSpec[] = [
  {
    email: 'islamic.male1@demo.lifemat',
    name: 'Abdullah Rahman',
    mode: 'ISLAMIC',
    gender: 'MALE',
    divisionName: 'Dhaka',
    districtName: 'Dhaka',
    professionKey: 'engineer',
    educationLevel: 'BACHELORS',
    dob: '1995-03-12',
    islamic: {
      prayerFrequency: 'FIVE_TIMES_DAILY',
      beardStyle: 'FULL_SUNNAH',
      aqidah: 'AHLE_SUNNAH_WAL_JAMAAH',
      madhhab: 'HANAFI',
      viewsOnLoans: 'AVOID',
    },
  },
  {
    email: 'islamic.female1@demo.lifemat',
    name: 'Fatima Akter',
    mode: 'ISLAMIC',
    gender: 'FEMALE',
    divisionName: 'Chattogram',
    districtName: 'Chattogram',
    professionKey: 'teacher',
    educationLevel: 'MASTERS',
    dob: '1998-07-22',
    islamic: {
      prayerFrequency: 'FIVE_TIMES_DAILY',
      hijabStyle: 'NIQAB_WITH_ABAYA',
      aqidah: 'AHLE_SUNNAH_WAL_JAMAAH',
      madhhab: 'HANAFI',
      viewsOnLoans: 'NECESSARY_ONLY',
      waliName: 'Md. Karim Akter',
      waliPhone: '+8801711000001',
    },
  },
  {
    email: 'islamic.male2@demo.lifemat',
    name: 'Yusuf Hossain',
    mode: 'ISLAMIC',
    gender: 'MALE',
    divisionName: 'Sylhet',
    districtName: 'Sylhet',
    professionKey: 'business',
    educationLevel: 'MADRASA_QAWMI',
    dob: '1993-11-05',
    islamic: {
      prayerFrequency: 'MOSTLY',
      beardStyle: 'TRIMMED',
      aqidah: 'SALAFI',
      madhhab: 'HANAFI',
      viewsOnLoans: 'FLEXIBLE',
    },
  },
  {
    email: 'islamic.female2@demo.lifemat',
    name: 'Ayesha Begum',
    mode: 'ISLAMIC',
    gender: 'FEMALE',
    divisionName: 'Rajshahi',
    districtName: 'Rajshahi',
    professionKey: 'homemaker',
    educationLevel: 'HSC',
    dob: '2000-01-18',
    islamic: {
      prayerFrequency: 'FIVE_TIMES_DAILY',
      hijabStyle: 'HIJAB_WITH_ABAYA',
      aqidah: 'AHLE_SUNNAH_WAL_JAMAAH',
      madhhab: 'HANAFI',
      viewsOnLoans: 'AVOID',
      waliName: 'Abdul Begum',
      waliPhone: '+8801711000002',
    },
  },
  {
    email: 'islamic.male3@demo.lifemat',
    name: 'Ibrahim Chowdhury',
    mode: 'ISLAMIC',
    gender: 'MALE',
    divisionName: 'Khulna',
    districtName: 'Khulna',
    professionKey: 'doctor',
    educationLevel: 'MASTERS',
    dob: '1990-09-30',
    islamic: {
      prayerFrequency: 'FIVE_TIMES_DAILY',
      beardStyle: 'FULL_SUNNAH',
      aqidah: 'AHLE_SUNNAH_WAL_JAMAAH',
      madhhab: 'SHAFII',
      viewsOnLoans: 'NECESSARY_ONLY',
    },
  },
  {
    email: 'general.male1@demo.lifemat',
    name: 'Rafi Ahmed',
    mode: 'GENERAL',
    gender: 'MALE',
    divisionName: 'Dhaka',
    districtName: 'Gazipur',
    professionKey: 'software_engineer',
    educationLevel: 'BACHELORS',
    dob: '1996-05-14',
    general: { smoking: 'NEVER', drinking: 'NEVER', diet: 'HALAL_ONLY' },
  },
  {
    email: 'general.female1@demo.lifemat',
    name: 'Nusrat Jahan',
    mode: 'GENERAL',
    gender: 'FEMALE',
    divisionName: 'Dhaka',
    districtName: 'Narayanganj',
    professionKey: 'banker',
    educationLevel: 'MASTERS',
    dob: '1997-12-08',
    general: { smoking: 'NEVER', drinking: 'NEVER', diet: 'HALAL_ONLY' },
  },
  {
    email: 'general.male2@demo.lifemat',
    name: 'Tanvir Hasan',
    mode: 'GENERAL',
    gender: 'MALE',
    divisionName: 'Chattogram',
    districtName: 'Cumilla',
    professionKey: 'civil_engineer',
    educationLevel: 'BACHELORS',
    dob: '1994-08-21',
    general: { smoking: 'OCCASIONALLY', drinking: 'NEVER', diet: 'HALAL_ONLY' },
  },
  {
    email: 'general.female2@demo.lifemat',
    name: 'Sadia Islam',
    mode: 'GENERAL',
    gender: 'FEMALE',
    divisionName: 'Sylhet',
    districtName: 'Sylhet',
    professionKey: 'pharmacist',
    educationLevel: 'BACHELORS',
    dob: '1999-04-03',
    general: { smoking: 'NEVER', drinking: 'NEVER', diet: 'HALAL_ONLY' },
  },
  {
    email: 'general.male3@demo.lifemat',
    name: 'Imran Khan',
    mode: 'GENERAL',
    gender: 'MALE',
    divisionName: 'Rajshahi',
    districtName: 'Bogura',
    professionKey: 'government_job',
    educationLevel: 'MASTERS',
    dob: '1992-06-17',
    general: { smoking: 'NEVER', drinking: 'NEVER', diet: 'HALAL_ONLY' },
  },
];

export async function seedDemoProfiles(prisma: PrismaClient) {
  const memberRole = await prisma.role.findUnique({ where: { name: 'Member' } });
  if (!memberRole) {
    console.warn('Member role missing — skip demo profiles');
    return;
  }

  const password = await hash.generateHash('password');

  for (const spec of DEMOS) {
    const existing = await prisma.user.findUnique({ where: { email: spec.email } });
    if (existing) continue;

    const division = await prisma.location.findFirst({
      where: { type: 'DIVISION', nameEn: spec.divisionName },
    });
    const district = division
      ? await prisma.location.findFirst({
          where: { type: 'DISTRICT', nameEn: spec.districtName, parentId: division.id },
        })
      : null;

    const user = await prisma.user.create({
      data: {
        name: spec.name,
        email: spec.email,
        password,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        roles: { create: { roleId: memberRole.id } },
        wallet: { create: { balance: 10 } },
      },
    });

    await prisma.$transaction(async tx => {
      const seq = await tx.biodataSequence.create({ data: {} });
      const biodataNo = `LM-${100000 + seq.id}`;

      const profile = await tx.profile.create({
        data: {
          biodataNo,
          mode: spec.mode,
          status: 'ACTIVE',
          fullName: spec.name,
          gender: spec.gender,
          dateOfBirth: new Date(spec.dob),
          maritalStatus: 'NEVER_MARRIED',
          educationLevel: spec.educationLevel,
          professionKey: spec.professionKey,
          divisionId: division?.id,
          districtId: district?.id,
          contactPhone: `+88017${String(10000000 + seq.id).slice(-8)}`,
          contactEmail: spec.email,
          completionPercent: 85,
          readinessPercent: 70,
          approvedAt: new Date(),
          createdByUserId: user.id,
          aboutMe: `Demo ${spec.mode.toLowerCase()} biodata for LifeMat matching tests.`,
          privacySettings: {
            create:
              spec.mode === 'ISLAMIC'
                ? {
                    visibility: 'PUBLIC',
                    photoPolicy: 'ON_UNLOCK',
                    contactPolicy: 'ON_UNLOCK',
                    hidePhone: true,
                  }
                : {
                    visibility: 'PUBLIC',
                    photoPolicy: 'VISIBLE',
                    contactPolicy: 'ON_UNLOCK',
                    hidePhone: false,
                  },
          },
          preference: {
            create: {
              ageMin: 22,
              ageMax: 35,
              minPrayerFrequency: spec.mode === 'ISLAMIC' ? 'MOSTLY' : undefined,
              hijabExpectation: spec.gender === 'MALE' ? 'HIJAB_WITH_ABAYA' : undefined,
              viewsOnLoansExpect: spec.mode === 'ISLAMIC' ? 'NECESSARY_ONLY' : undefined,
              acceptsExpat: true,
              educationLevels: ['BACHELORS', 'MASTERS', 'HSC'],
            },
          },
          ...(spec.islamic
            ? {
                islamicDetails: {
                  create: {
                    prayerFrequency: spec.islamic.prayerFrequency,
                    hijabStyle: spec.islamic.hijabStyle,
                    beardStyle: spec.islamic.beardStyle,
                    aqidah: spec.islamic.aqidah,
                    madhhab: spec.islamic.madhhab,
                    viewsOnLoans: spec.islamic.viewsOnLoans,
                    waliName: spec.islamic.waliName,
                    waliPhone: spec.islamic.waliPhone,
                    waliRelation: spec.islamic.waliName ? 'FATHER' : undefined,
                    waliApproves: true,
                  },
                },
              }
            : {}),
          ...(spec.general
            ? {
                generalDetails: {
                  create: spec.general,
                },
              }
            : {}),
        },
      });

      await tx.profileMember.create({
        data: {
          userId: user.id,
          profileId: profile.id,
          relationship: 'SELF',
          role: 'OWNER',
          inviteStatus: 'ACCEPTED',
        },
      });
    });
  }

  console.log('Demo matrimony profiles seeded (5 Islamic + 5 General).');
}
