# Workday Journey V8.8.0 — QA Notes

## ตรวจสอบที่ทำแล้ว

- `node --check` ผ่านสำหรับ `workday-core.js`, `workday-features.js`, `workday-universal-recovery.js`, `service-worker.js`
- ยืนยันว่า `APP_VERSION`, เวอร์ชัน UI, HTML asset query strings และ Service Worker cache ใช้ `8.8.0`
- ตรวจการแก้ Source โดยจำกัดไว้ที่เลขเวอร์ชัน, ข้อความ Version ที่ปรากฏบนหน้า, และเพิ่มบรรทัด What's New
- ไม่แก้ SQL/RPC/Database หรือการคำนวณ Coin/หุ้น/Bank/Journal/Missions
- ตรวจโครงสร้าง ZIP และการมีอยู่ของเอกสาร README/CHANGELOG/History/Release Process

## ยังไม่ได้ตรวจสอบกับระบบจริง

- Login/Guest, Supabase production, Coin Wallet/Bank/Exchange ระหว่างใช้งานจริง
- Service Worker update กับเว็บไซต์ที่ Deploy แล้ว และการรันบนอุปกรณ์ของผู้ใช้

## เช็กลิสต์หลัง Deploy

- [ ] Sidebar, Setup, Footer, Missions และ What's New เป็น V8.8.0
- [ ] ไม่ปรากฏแถบ Old UI Flash หรือเกิด Refresh loop
- [ ] Guest ข้อมูล Local เดิมยังอยู่
- [ ] Login ยอด Coin/Bank/หุ้นไม่เปลี่ยนหลัง Refresh เมื่อไม่มีการทำธุรกรรม
- [ ] Daily Journal/Missions ยังคงได้รับ Coin/XP ตามเงื่อนไขและไม่ซ้ำ
- [ ] Work Bank Streak และ +15 Completed Workday ทำงานตามแพตช์ก่อน
- [ ] Work Exchange / Portfolio / History ใช้งานได้
- [ ] ส่งคำขอ Recovery/Owner Approval ผ่านเมื่อมีข้อมูลทดสอบ
