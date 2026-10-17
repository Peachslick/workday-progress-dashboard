# Workday Journey — Changelog

บันทึก **เวอร์ชัน → ปัญหา/เหตุผล → สิ่งที่แก้หรือเพิ่ม → ผลต่อผู้ใช้/การติดตั้ง** เพื่อใช้อ่านย้อนหลังใน GitHub

> Version history is based on the available project release notes, code snapshots and patch discussion. Earlier minor releases are grouped where individual patch artifacts are not available; do not treat an unlisted patch as confirmation that it never existed.

## [8.8.1] — 2026-10-17 — Targeted Fixes

**Why:** Static Code Review พบเงื่อนไขที่ทำให้ตลาดหุ้นจำลองถูกล็อกหลัง Journey สิ้นสุด รวมถึงการนับความคืบหน้าของ Bank/Trading Achievement ของบัญชี Login ยังอาศัยข้อมูลใน Browser บางส่วน และหน้าจอยังมีเลขเวอร์ชันเก่า

**Fixed**
- **Work Exchange:** ไม่ปิดตลาดเมื่อ Journey ส่วนตัวจบแล้ว; ตลาดปิด/เปิดตามเวลา 07:00–16:00 จ.–ศ. ตามกติกาเดิม การซื้อขายของบัญชี Login ยังถูกตรวจสอบโดย RPC ที่ติดตั้งอยู่
- **Bank Achievements:** Login ใช้ Cloud Bank snapshot และธุรกรรมของบัญชีเพื่อคำนวณความคืบหน้า แยกจาก Local/Guest; ไม่แก้เงินต้นหรือดอกเบี้ยในฐานข้อมูล
- **Trading Achievements:** Login ใช้ข้อมูล Portfolio/Trade History จาก Cloud เพื่อคำนวณความคืบหน้า ไม่อ่านประวัติหุ้น Guest มาผสม; ไม่เพิ่ม Coin จาก Browser
- **Completed Workday:** เช็กเวลาเลิกงานที่ผู้ใช้กำหนดร่วมกับ minimum cutoff 16:10 ของ RPC ในปัจจุบัน ป้องกันการส่งคำขอก่อนทำงานครบตามเวลา
- **Version UI:** ปรับป้ายเวอร์ชันในหน้าเว็บ/Sidebar/What's New และ cache-busting URL/Service Worker เป็น `V8.8.1`

**Important limits:** RPC แจก +15 ยังคงมี minimum **16:10 Asia/Bangkok** สำหรับวันปัจจุบัน แม้ผู้ใช้เลิกงานก่อนหน้านั้น. การนับ Achievement Cloud จาก Snapshot ไม่ใช่ Migration ของ Lifetime Achievements หรือการจ่าย Coin ย้อนหลัง และระหว่าง Cloud โหลดอาจแสดงความคืบหน้าเป็น 0 ชั่วคราวก่อนข้อมูลมาถึง

**Migration:** ไม่มี SQL / schema / RPC ใหม่ และไม่ลบหรือ Reset LocalStorage, Wallet, Portfolio, Recovery หรือประวัติเดิม. อัปเดต frontend 4 ไฟล์, README/CHANGELOG แล้ว Deploy

---

## [8.8.0] — 2026-10-17 — Stability Milestone & Documentation Refresh

**Why:** ชื่อเวอร์ชัน V8.7.10.3.7.3 ยาวมาก และรายละเอียดการอัปเดตกระจัดกระจายอยู่ในหลาย ZIP / คู่มือ ทำให้ติดตามย้อนหลังได้ยาก

**Changed**
- เริ่มใช้ **V8.8.0** เป็นเลขเวอร์ชันหลักสำหรับโปรเจกต์
- อัปเดตจุดแสดงเวอร์ชันในเว็บ ได้แก่ Setup, Sidebar, Footer, Daily Missions, What's New, PWA cache และ asset URL
- เพิ่ม `README.md`, `CHANGELOG.md`, release checklist และเก็บ README เก่าที่เคยใช้บน GitHub เป็น archive

**Unchanged / Migration:** ไม่แก้ Logic / DB / RPC ของ Coin, Work Bank, Work Exchange, Missions หรือ Recovery; **ไม่ต้องรัน SQL ใหม่**

---

## V8.7.10.3.x — Economy Stabilization & Legacy Recovery

### [8.7.10.3.7.3] — Savings Streak & Completed Workday Coin Fix

**Why:** บัญชี Login มีเงินออมต่อเนื่อง แต่ Saving Master (7 วัน) / Diamond Saver (14 วัน) นับได้เพียง 1 วัน และทำงานครบวันแล้วไม่ได้ +15 Coin

**Fixed**
- อ่าน Savings Streak จากข้อมูล Bank ที่ยืนยันบน Cloud; ถอนเพียงบางส่วนแล้วเงินออมยังเหลือ จะไม่รีเซ็ต Streak
- เพิ่ม RPC คืนการให้ Completed Workday **+15 Coin** สำหรับบัญชี Login พร้อมกันรับซ้ำต่อวัน
- เพิ่มขั้นตอนตรวจย้อนหลังเฉพาะวันที่มีหลักฐานใน Cloud และจำกัดการกู้ย้อนหลังเพื่อหลีกเลี่ยงยอดซ้ำ

**Install:** รัน SQL Migration ของแพตช์นี้ก่อน Deploy; **อย่ารัน Migration เก่าซ้ำโดยไม่มีเหตุผล**

### [8.7.10.3.7.2] — Universal Legacy Data Recovery

**Why:** ผู้ใช้ที่มีหุ้นเก่าใน Browser อาจมีข้อมูลมากกว่า Cloud และผู้ใช้ที่เคยกู้คืนแล้วอาจยังพบรายการซื้อขายเพิ่มเติมภายหลัง

**Added**
- ผู้ใช้ Login ส่งคำขอตรวจสอบประวัติซื้อขาย Local ที่ยังไม่อยู่ใน Cloud ได้ (ต้องยืนยันด้วยตนเอง)
- Owner ดูผลเปรียบเทียบ ตรวจหลักฐาน และอนุมัติเฉพาะรายการที่ผ่านการตรวจ
- ป้องกันการนำเข้าประวัติซ้ำ และหยุดเมื่อพบลำดับซื้อขายที่อาจทำให้ต้นทุนผิด

**Safety:** การกู้หุ้นไม่เพิ่ม/หัก Coin หรือแก้ Work Bank อัตโนมัติ; ต้องติดตั้ง SQL ของแพตช์นี้และทดสอบ Owner approval

### [8.7.10.3.7.1] — Legacy Portfolio Recovery

**Why:** มีหุ้นเก่าที่ Owner อนุมัติไว้ในระบบ Recovery แต่ยังไม่ปรากฏใน Portfolio Cloud ใหม่

**Added**
- SQL ตรวจสอบหุ้นเก่าและความถูกต้องของประวัติ
- นำเข้าหุ้นคงเหลือพร้อมต้นทุนและประวัติที่อนุมัติแล้วแบบครั้งเดียว
- SQL ตรวจผลหลังนำเข้าและป้องกันนำเข้าซ้ำ

**Observed migration outcome:** การทดสอบการนำเข้าชุดหนึ่งได้ 3 บัญชี / 23 ธุรกรรม เป็นผลของชุดข้อมูลที่ตรวจในเวลานั้น **ไม่ใช่ยอดรับประกันสำหรับทุกฐานข้อมูล**

### [8.7.10.3.7] — Secure Cloud Exchange Trading & Compact Reward Toast

**Why:** Work Exchange เดิมทำรายการซื้อ/ขายใน LocalStorage สำหรับบัญชี Login แต่ยอด Wallet ถูกโหลดใหม่จาก Cloud ทำให้ Coin หรือ Portfolio บนหน้าจอไม่ตรงหลัง Refresh

**Added / Fixed**
- ระบบซื้อขายหุ้นจำลองผ่าน SQL/RPC สำหรับบัญชี Login
- บันทึก Coin, หุ้น และประวัติเป็นธุรกรรมเดียวกัน พร้อมป้องกันการสั่งซื้อขายซ้ำ
- โหลด Portfolio และ Trade History จาก Cloud; Guest ยังใช้โหมด Local
- ลดขนาด Popup แจ้งการรับ Coin/Quest XP โดยไม่ย่อข้อความเตือนข้อผิดพลาด

**Install:** ต้องติดตั้ง Cloud Exchange Migration ก่อน Deploy เว็บ

### [8.7.10.3.6.3] — Classic Daily Missions & Daily Journal Coin Fix

**Why:** ภารกิจใหม่แสดงชื่อกิจกรรมหนึ่ง แต่ตรวจรับรางวัลด้วยเงื่อนไขของอีกกิจกรรม และผู้ใช้ Login บันทึก Journal แล้วไม่ได้ Coin

**Fixed**
- คืนภารกิจคลาสสิก **13 ประเภท เลือก 3 ภารกิจต่อวัน** ตามกิจกรรมจริง พร้อมลดภารกิจซ้ำข้ามวัน
- บันทึก Journal วันนี้ได้รับ **+10 Coin** (ไม่จ่ายซ้ำวันเดิม) ผ่าน RPC สำหรับ Login
- ให้ Quest XP เมื่อรับรางวัลสำเร็จ และรักษา Daily/Weekly Chest

**Install:** มี SQL Migration; ต้องรัน SQL ก่อน Deploy

### [8.7.10.3.6.2] — History View Restore

**Why:** หน้า Coin History ของ Login เคยแสดงเพียงบรรทัดยอดรวมแทนประวัติธุรกรรมจริง

**Fixed:** แสดง Coin History ที่ยืนยันในบัญชี; เปิดดูรายการ Coin/หุ้นเก่าใน Browser แบบอ่านอย่างเดียว โดยไม่บวกยอดซ้ำ

### [8.7.10.3.6.1] — UI Message Cleanup

**Why:** ข้อความระบบ/ชื่อผู้ให้บริการฐานข้อมูลทำให้ผู้ใช้กังวล

**Changed:** ลดข้อความทางเทคนิคที่ไม่จำเป็นใน Work Bank, Daily Missions, Coin History, Exchange และ Account โดยยังเก็บคำเตือนเมื่อการทำรายการไม่สำเร็จ

### [8.7.10.3.6] — Cloud Economy & Exchange Safety Hotfix

**Why:** บัญชี Login ซื้อขายหุ้นผ่าน LocalStorage ได้ แต่ Wallet ที่ยืนยันบน Server ไม่รู้จักรายการเหล่านั้น

**Fixed**
- ให้บัญชี Login แสดงยอด Wallet ที่ Cloud ยืนยันเท่านั้น
- ระงับการซื้อขายแบบ Local สำหรับ Login ชั่วคราวจนกว่าจะมี RPC ซื้อขาย
- คงหลักฐานหุ้น/ประวัติเดิมไว้สำหรับ Recovery; Guest ยังทำงานเหมือนเดิม

### [8.7.10.3.5] — Rotating Daily Missions

**Why:** บัญชี Login ถูกจำกัดให้เจอเพียงภารกิจ 3 ประเภทซ้ำ ๆ

**Changed:** เริ่มให้ Login มีชื่อและเป้าหมายหมุนเวียนจากภารกิจคลาสสิก แต่ในรุ่นนี้เงื่อนไขรับรางวัลยังผูกกับ Server 3 ประเภท จึงเกิดข้อผิดพลาดที่แก้จริงใน V8.7.10.3.6.3

### [8.7.10.3.4] — Missions & Dashboard Hotfix

**Focus:** ปรับหน้าภารกิจคลาสสิกและแก้ Dashboard ที่แสดงแถบเลื่อนกระพริบจากการ Refresh ถี่

### [8.7.10.3.x, earlier] — Chest Inventory / Classic Mission work

**Focus:** จัดเก็บ Daily, Weekly และ Mystery Chests ในคลัง, ลดภารกิจที่ซ้ำซ้อนกับหน้ารายงาน และปรับให้ภารกิจประจำวันกลับมาทำงานแบบเรียบง่าย

---

## V8.7 — Virtual Workspace & Journey

| Release | What changed |
|---|---|
| V8.7.10 | Daily Life Quest และการจัดระเบียบ Navigation เพื่อลดเมนูซ้ำ |
| V8.7.9 | Journey Wrapped สรุปประสบการณ์ในรูปแบบการ์ด |
| V8.7.8 | Productivity Insights 2.0 และการวิเคราะห์ความคืบหน้าที่ละเอียดขึ้น |
| V8.7.7 | Journey Timeline: ประวัติการทำงานและเหตุการณ์ย้อนหลัง |
| V8.7.6 / 8.7.6.1 | Skill Tree & Career Growth; Personalized Skill Tree และ Smart Tagging |
| V8.7.5 | Focus Studio และตัวจับเวลาโฟกัส |
| V8.7.4 | Workspace Events & Polish |
| V8.7.3 | เฟอร์นิเจอร์และของตกแต่งห้อง |
| V8.7.2 | Mascot Friendship & Evolution |
| V8.7.1 | Mascot Life & Animation |
| V8.7.0 | Pixel Art Virtual Workspace Foundation |

**Background:** V8.7 เน้น Journey/Gamification และประสบการณ์ส่วนตัว จากนั้นสาย V8.7.10.3.x เน้นทำ Economy กับกิจกรรมเดิมให้สอดคล้องกับ Cloud Security

---

## V8.6 — Cloud Recovery, Security & Usability

| Release | What changed |
|---|---|
| V8.6.0.8 | Accessibility, font size, contrast และ keyboard usability |
| V8.6.0.7 | Notification Center Refresh |
| V8.6.0.6 | Data Safety & Backup Tools |
| V8.6.0.5 | Loading / Performance Optimization |
| V8.6.0.3 | Automatic Legacy Data Recovery + Owner Approval |
| V8.6.0.2 | UI Startup & Personalization; ลด old-UI flash, เลือกขนาด UI/ไอคอน |
| V8.6.0.1 | Cloud Sync & Bank Hotfix (ปัญหาฝากเงินแล้วเด้งกลับ) |
| V8.6.0 | Security & Anti-Cheat; จำกัดช่องทางแก้ Economy ผ่าน Browser |

**Background:** เพิ่มการป้องกันการแก้ Coin ผ่าน DevTools และแยกการจัดเก็บที่เชื่อถือได้ของบัญชี Login ออกจาก Local Guest ข้อมูลเก่าที่มีอยู่ก่อนต้องอาศัย Recovery ที่ตรวจสอบได้

---

## V8.5 — UX/UI Refresh & Economy Security

| Release | What changed |
|---|---|
| V8.5.5 | Final Polish & Responsive QA |
| V8.5.4 | Finance Hub UI Refresh (Work Bank / Exchange / Trading Academy) |
| V8.5.3 | Gamification UI Refresh (Achievements / Missions / Rewards) |
| V8.5.2 | Core Work Pages Refresh (Dashboard / Journal / Projects / Calendar / Reports) |
| V8.5.1 | Global Design System (typography, spacing, radius, components) |
| V8.5.0.1 | Economy Security Hardening: secure Coin/Reward inventory, server-side Reward Shop purchase, one-time legacy import |
| V8.5.0 | Navigation & App Shell Refresh: sidebar groups, cleaner topbar, mobile navigation |

**Background:** เดิม Reward Code/Rewards ใช้ข้อมูล Local มาก; V8.5.0.1 เริ่มเปลี่ยนบางส่วนให้ Cloud เป็นผู้ยืนยัน Economy เพื่อจำกัดการแก้ยอดผ่าน Browser

---

## V8.4 — Exchange, Rewards & Cloud Features

| Release | What changed |
|---|---|
| V8.4.8.1 | Reward Code RPC ambiguity hotfix (`column reference "code" is ambiguous`) |
| V8.4.8 | Reward Codes & Developer Control Center; Owner roles, redemption limits |
| V8.4.7.x | Achievement UI, Smart Cloud Sync, What's New/Version History, Account UX และการปรับอัตรารีเฟรชตลาด |
| V8.4.6 | Finance & Feature Achievements |
| V8.4.5 | Project File Vault บน Supabase Storage |
| V8.4.4 | Daily Deals / Work Bank promotion tuning |
| V8.4.3 | Chest Opening Experience |
| V8.4.2 | Typography & Sidebar Reorder |
| V8.4.1 | Trading Academy / Beginner Mode |
| V8.4.0 | Work Exchange — ตลาดหุ้นจำลอง |

รายละเอียด V8.4.8, V8.4.8.1 และ V8.5.0 ที่บันทึกไว้ตั้งแต่แรกยังอ่านได้ใน [README รุ่นเดิม](docs/history/README_V8.5.0_original.md)

---

## V8.0–V8.3 — Original Economy & Daily Work

| Release | What changed |
|---|---|
| V8.3 | Work Bank Savings / Interest / compound savings, shop expansion |
| V8.2 | Coin Economy Rebalance, Daily Missions 13 ประเภท, Daily & Weekly Chests |
| V8.1 | Work Coins, Reward Shop, Mascot Unlock, retroactive achievement planning |
| V8.0 | Cloud Sync and productivity improvements |
| V7 | Multi-page workspace, Journey/Challenges/achievement foundations |
| V6 | Daily Journal, Project Tracker, Reports |

---

## Release rules from V8.8 onward

- ใช้ `V8.MINOR.PATCH` (เช่น `8.8.0`, `8.8.1`, `8.9.0`)
- ทุกครั้งต้องเขียนว่า **Why / Added / Changed / Fixed / Database / Risks / Tests**
- SQL เก่าที่เคยติดตั้งแล้ว **ไม่ใช่ขั้นตอนอัปเดตซ้ำ**; ระบุเฉพาะ Migration ใหม่ที่จำเป็นในแต่ละ Release
- ห้ามล้าง Guest LocalStorage หรือนำ Local Coin/Stock เข้าบัญชี Cloud โดยไม่มีขั้นตอนตรวจสอบ
- ไม่บอกว่า Production ปลอดบัค 100% จนกว่าจะผ่านการทดสอบจริง

ดู [Release Process](docs/RELEASE_PROCESS_TH.md)
