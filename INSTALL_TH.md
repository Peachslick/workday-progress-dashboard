# Workday Journey V8.8.0 — Installation (Version & Documentation Only)

## ก่อนติดตั้ง

- ใช้กับเว็บที่ติดตั้ง **V8.7.10.3.7.3** แล้ว และ SQL Migration ที่จำเป็นในแพตช์ก่อนหน้านี้ติดตั้งสำเร็จ
- Backup โค้ดล่าสุด/LocalStorage ที่ต้องเก็บ และจดยอด Cloud Wallet/Bank/Portfolio สำหรับทดสอบหลัง Deploy
- **V8.8.0 ไม่ต้องรัน SQL** และไม่เพิ่ม/ลบ Database table/RPC

## ไฟล์ที่วางทับเว็บเดิม (5 ไฟล์)

นำไฟล์ต่อไปนี้จากโฟลเดอร์ `web/` ไปวางทับไฟล์ชื่อเดียวกันในโปรเจกต์:

1. `index.html`
2. `workday-core.js`
3. `workday-features.js`
4. `workday-universal-recovery.js`
5. `service-worker.js`

**อย่าลบไฟล์เดิมที่ไม่ได้อยู่ใน ZIP** เช่น `workday.css`, `supabase-config.js`, `manifest.webmanifest`, SQL และไฟล์อื่น ๆ

## เอกสาร GitHub (เพิ่มใหม่)

- วาง `README.md` ที่ Root Repository เพื่อให้ GitHub แสดงเป็นหน้าแรก
- วาง `CHANGELOG.md` ที่ Root Repository สำหรับอ่านประวัติรุ่นย้อนหลัง
- วางโฟลเดอร์ `docs/` ที่ Root Repository (`README.md` ลิงก์ไว้แล้ว)
- `INSTALL_TH.md` เป็นคู่มือของแพตช์นี้ จะเก็บไว้ใน Root หรือใน `docs/releases/` ก็ได้

## Deploy & QA

1. Commit + Deploy
2. ใน Browser เปิดเว็บแล้วกด `Ctrl + Shift + R` หรือใช้คำสั่ง Reload Latest Version
3. ตรวจ Sidebar, Setup/Settings, Footer, Missions, What's New และ PWA ว่าแสดง V8.8.0
4. ตรวจ Guest และ Login: Journal/Missions/XP, Coin Wallet/History, Bank Streak, +15 Completed Workday, Exchange Portfolio/History, Recovery
5. ตรวจยอด Wallet/Bank/หุ้นก่อนและหลัง Refresh ว่าไม่ได้เปลี่ยนเพราะการอัปเดตเลขเวอร์ชัน

## ขอบเขตและ Rollback

- แพตช์นี้ทำเฉพาะ version labels/cache/docs และเพิ่มรายการ release ในหน้า What's New
- ไม่แก้สูตรราคา/ภารกิจ/ดอกเบี้ย, ไม่เคลื่อนย้ายข้อมูลผู้ใช้ และไม่แตะ Database
- ถ้าแสดงเวอร์ชันเก่าปะปน: ตรวจการ Deploy และ Service Worker ก่อน **อย่า Clear Site Data/LocalStorage**
- ถ้าจำเป็นต้องย้อน ให้คืน 5 ไฟล์เว็บจาก Commit/Backup ของ V8.7.10.3.7.3; ไม่มี DB rollback สำหรับรุ่นนี้

> สำคัญ: การตรวจ Syntax และ Static Checks ไม่ใช่การยืนยัน Production ทุกฟีเจอร์ ควรลองกับบัญชีทดสอบก่อนเผยแพร่
