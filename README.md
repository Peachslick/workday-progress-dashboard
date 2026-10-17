# Workday Journey

**Current release: V8.8.0 — Stability Milestone & Documentation Refresh**  
**Previous release: V8.7.10.3.7.3 — Savings Streak & Workday Coin Fix**

> Workday Journey คือเว็บติดตามวันทำงาน / การฝึกงาน พร้อม Daily Journal, Projects, ปฏิทิน, รายงาน, ความสำเร็จ, Missions, Work Coins, Reward Shop, Work Bank และ Work Exchange แบบจำลอง  
> A personal workday and internship progress tracker with optional account-based Cloud Sync and gamification.

## 📌 V8.8.0 มีอะไรใหม่?

V8.8.0 เป็น **เวอร์ชันจัดระเบียบ (release milestone)** หลังแก้ปัญหาระบบ Economy และ Recovery หลายแพตช์ ไม่ใช่การย้ายข้อมูลหรือเพิ่ม SQL ใหม่

- เปลี่ยนเลขเวอร์ชันที่แสดงในเว็บเป็น **V8.8.0** รวมถึงหน้า Setup, Sidebar, Daily Missions, Footer และ What's New
- ปรับเวอร์ชัน PWA / Service Worker / asset URLs เพื่อให้ Browser โหลดเว็บชุดเดียวกัน
- เริ่มใช้ `README.md` เป็นหน้าหลักของ GitHub และ `CHANGELOG.md` เก็บประวัติแพตช์และเหตุผลการเปลี่ยนแปลง
- เก็บสำเนา README รุ่นก่อน (V8.5.0) ใน `docs/history/` เพื่อไม่ให้ประวัติการพัฒนาช่วงต้นหายไป
- **ไม่เปลี่ยน** กลไก Coin, Daily Missions, Journal, Work Bank, Trading, Portfolio, Recovery หรือโครงสร้างฐานข้อมูลในรุ่นนี้

📖 **อ่านประวัติทั้งหมด:** [CHANGELOG.md](CHANGELOG.md)  
📚 **README รุ่นก่อน:** [README V8.5.0 (Archive)](docs/history/README_V8.5.0_original.md)  
🛠 **แนวทางออกเวอร์ชันใหม่:** [Release Process](docs/RELEASE_PROCESS_TH.md)

## 🗓 ความเป็นมาของโปรเจกต์

Workday Journey เริ่มจากการติดตามความคืบหน้าของวันทำงาน แล้วค่อย ๆ ขยายเป็นเครื่องมือส่วนตัวที่มีระบบจดบันทึก โปรเจกต์ รายงาน และเกมสะสมรางวัล

| ช่วงเวอร์ชัน | หมุดหมายของโปรเจกต์ |
|---|---|
| V6–V7 | Daily Journal, Projects, Calendar, Reports, Dashboard และ Achievements |
| V8.0–V8.2 | Cloud Sync, Work Coins, Reward Shop, Daily Missions และ Chests |
| V8.3–V8.4 | Work Bank, ดอกเบี้ยทบต้น, Work Exchange, Trading Academy และ Reward Codes |
| V8.5 | UX/UI Refresh และเริ่มทำ Economy Security แบบ Server-authoritative |
| V8.6 | Security, Cloud Recovery, Data Safety, Performance และ Accessibility |
| V8.7 | Virtual Workspace, Mascot Life, Focus Studio, Skill Tree, Timeline, Wrapped และ Insights |
| V8.7.10.3.x | กู้ฟังก์ชัน Missions/Coin ที่เคยทำงานได้ และย้ายการซื้อขายหุ้น/กู้หุ้นเก่าเข้าฐานข้อมูลอย่างปลอดภัย |
| **V8.8.0** | รวมงานที่เสถียรเป็นเวอร์ชันหลักใหม่และจัดทำเอกสาร GitHub |

ดูรายละเอียดแต่ละแพตช์ใน **[CHANGELOG.md](CHANGELOG.md)**

## ✨ Main Features

| หมวด | ฟีเจอร์ |
|---|---|
| Work & Journey | Dashboard, Daily Journal, Project Tracker, Calendar & Attendance, Reports |
| Productivity | Focus Studio, Skill Tree, Journey Timeline, Productivity Insights, Journey Wrapped |
| Gamification | Achievements, Daily Missions, Daily / Weekly / Mystery Chests, Reward Shop |
| Personalization | Mascots, Themes, Effects, Accessories, Profile Frames, Virtual Workspace |
| Finance (simulated) | Work Coins, Work Bank, Savings Streak, Work Exchange, Trading Academy |
| Cloud & Admin | Supabase Auth/Sync, Coin History, Reward Codes, Project File Vault, Owner Control Center, approved Legacy Recovery |

**ข้อชี้แจง:** Work Coins และ Work Exchange เป็นระบบจำลองในเว็บ ไม่ใช่สกุลเงินจริงหรือบริการลงทุนจริง

## 🧩 Technology & Data

- **Frontend:** HTML, CSS, JavaScript และ Service Worker/PWA
- **Cloud:** Supabase Authentication, PostgreSQL / Row Level Security (RLS), RPC, และ Storage ในฟีเจอร์ที่เกี่ยวข้อง
- **Guest Mode:** ใช้งานข้อมูลภายใน Browser (LocalStorage)
- **Login Mode:** Coin Wallet, Bank และการซื้อขายหุ้นที่รองรับ Cloud ใช้ Server เป็นผู้ตรวจและบันทึกธุรกรรม ขณะที่ข้อมูล Journey บางส่วนยังใช้ระบบ Sync แยกต่างหาก

### Guest vs Login

| ระบบ | Guest / Local | Login / Cloud |
|---|---|---|
| Daily Journal / Journey | Local | Sync ตามการตั้งค่าบัญชี |
| Daily Missions | เล่นและรับรางวัลได้ | เล่นและรับรางวัลผ่านการตรวจสอบ Cloud |
| Coin Wallet | บันทึกภายใน Browser | ใช้ยอดที่ฐานข้อมูลยืนยัน |
| Work Bank | ข้อมูล Local | บันทึกธุรกรรมผ่าน RPC |
| Work Exchange | ซื้อขายหุ้นจำลองใน Browser | ซื้อขายหุ้นจำลองและเก็บ Portfolio/History บน Cloud |
| Legacy Data Recovery | เก็บข้อมูลเก่าไว้ในอุปกรณ์ | ส่งคำขอให้ Owner ตรวจสอบก่อนนำเข้าหุ้น |

> **Security:** อย่านำ `service_role` key, รหัสผ่าน, API Secret หรือข้อมูลจริงของผู้ใช้ขึ้น GitHub โดยเด็ดขาด ข้อมูล LocalStorage สามารถแก้ไขได้ จึงไม่ควรเชื่อเป็นหลักฐานจ่าย Coin หรือหุ้นโดยอัตโนมัติ

## 🚀 การอัปเดตจาก V8.7.10.3.7.3 เป็น V8.8.0

**ไม่ต้องรัน SQL ใหม่** สำหรับ V8.8.0 หากได้ติดตั้ง Migration ของ V8.7.10.3.7.3 และแพตช์ก่อนหน้าเรียบร้อยอยู่แล้ว

1. สำรองไฟล์เว็บไซต์ และสำรองข้อมูล Browser / Supabase ตามความเหมาะสม
2. วางไฟล์ที่เปลี่ยนจากแพตช์ V8.8.0 ในตำแหน่งเดิมของเว็บ (ดู [INSTALL_TH.md](INSTALL_TH.md))
3. วาง `README.md`, `CHANGELOG.md`, และ `docs/` ที่ **root repository** ของ GitHub (ไม่ใช่ใน `web/` หาก GitHub root ใช้ layout เดียวกับโปรเจกต์)
4. Commit และ Deploy เว็บไซต์
5. กด **Ctrl + Shift + R** หรือใช้เมนู Reload Latest Version แล้วตรวจว่าเลขบน Sidebar / Settings / What's New เป็น **V8.8.0**
6. ทดสอบ Coin, Journal, Bank, Exchange, Missions และ Recovery ด้วยบัญชีทดสอบก่อนปล่อยใช้งานทั่วไป

**หมายเหตุ:** ZIP เวอร์ชันนี้ส่งเฉพาะไฟล์ที่แก้ ไม่ใช่โปรเจกต์เต็ม ให้เก็บ CSS, config, SQL เดิมและไฟล์อื่นทั้งหมดไว้เหมือนเดิม

## 🔐 Data Safety & Recovery

- ไม่ควรล้าง LocalStorage ในเครื่องเก่าที่มีประวัติซื้อขายหุ้นยังไม่ได้ขอกู้
- ข้อมูลหุ้นเก่าต้องมีหลักฐานและผ่านการอนุมัติของ Owner ก่อนเข้าพอร์ต Cloud
- การคืนหุ้น **ไม่เท่ากับ** การคืน Coin; ต้องตรวจสอบสองส่วนแยกกันเพื่อป้องกันยอดซ้ำ
- รางวัล Daily Journal, Missions และ Completed Workday สำหรับผู้ใช้ Login ต้องผ่าน RPC ที่ป้องกันการจ่ายซ้ำ
- ปัญหา Work Bank Streak / Completed Workday +15 ที่เคยเกิดขึ้นได้รับการแก้ใน V8.7.10.3.7.3 แต่ควรทดสอบตามขั้นตอนของแพตช์เดิมหลัง Deploy

## 🏷 วิธีตั้งชื่อเวอร์ชันต่อไป

เริ่มจาก V8.8.0 ใช้รูปแบบ **MAJOR.MINOR.PATCH** โดยไม่เพิ่มเลขย่อยซ้อนหลายชั้น:

- `V8.8.0` — Release milestone / รวมระบบและเอกสาร
- `V8.8.1` — Bug fix หรือปรับปรุงขนาดเล็กหลัง V8.8.0
- `V8.9.0` — เพิ่มฟีเจอร์หลักชุดใหม่
- `V9.0.0` — เปลี่ยนระบบ/โครงสร้างครั้งใหญ่ที่ต้องวางแผน Migration

ทุกแพตช์ควรอัปเดต **App version, PWA cache, README และ CHANGELOG** พร้อมกัน แล้วระบุชัดเจนว่าต้องรัน SQL หรือไม่ ดู [Release Process](docs/RELEASE_PROCESS_TH.md)

## 🧭 What's Next?

1. **V8.8.x – Regression / Data Integrity:** ทดสอบใช้งานจริงหลังจัดเวอร์ชันใหม่ โดยเฉพาะ Economy / Reward / Guest-Login parity และความถูกต้องของ Cloud History
2. **V8.9.0 – Next Feature Milestone:** เลือกฟีเจอร์ใหม่ที่ผู้ใช้ต้องการ เช่น ปรับหน้า Reward/Achievement ให้อ่านง่าย หรือระบบภาพรวมความก้าวหน้า โดยไม่รื้อ Wallet/RPC ที่ทำงานอยู่

---

**Project:** Workday Journey  
**Version:** `8.8.0`  
**Release type:** Version reset, cache refresh and documentation only  
**Database migration required:** **No**
