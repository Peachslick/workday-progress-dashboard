# Workday Journey — Release Process (TH)

## เลขเวอร์ชัน

- รุ่นแก้ไขปัญหาเล็ก ๆ: `V8.8.1`, `V8.8.2`, ...
- รุ่นเพิ่มฟีเจอร์หลัก: `V8.9.0`
- รุ่นเปลี่ยนโครงสร้างใหญ่: `V9.0.0` (ต้องวางแผน Migration)
- หลีกเลี่ยงรุ่นต่อท้ายมากกว่า 3 หลัก เช่น `8.7.10.3.7.3`

## Checklist ก่อน Release

- [ ] เก็บ Baseline / Backup โค้ดล่าสุดและผลทดสอบก่อนแก้
- [ ] ถ้ามีการเปลี่ยน Database ให้ Backup หรือทดสอบ Staging และตรวจ SQL/RPC/RLS ก่อน Deploy
- [ ] ไม่เปลี่ยนการบันทึก Coin/หุ้นจาก Server เป็น Local สำหรับบัญชี Login
- [ ] อัปเดตเลขเวอร์ชันใน Core, Features, Recovery UI, หน้า Setup, index asset URLs, Service Worker/cache และ in-app What's New
- [ ] เพิ่มรายการใน `CHANGELOG.md` ด้วยหัวข้อ Why / Added / Changed / Fixed / SQL / Verification
- [ ] อัปเดต `README.md` (Current release, การติดตั้ง, Known limitations)
- [ ] ตรวจ `node --check` สำหรับ JavaScript ทุกไฟล์ที่เปลี่ยน
- [ ] ทดสอบ Guest + Login / Refresh / ปิดและเปิดเว็บใหม่ / เปิดต่างอุปกรณ์ / Cloud Auth
- [ ] ทดสอบ Wallet, Journal Coin, Completed Workday +15, Work Bank streak, Exchange Trade, Recovery approval, Coin History
- [ ] ตรวจปุ่มสำคัญและ UI บน Desktop/Mobile, Light/Dark
- [ ] ตรวจความถูกต้องของ Asset Cache: ไม่มีการใช้ JS รุ่นเก่าปะปนกัน
- [ ] ตรวจว่าไฟล์ ZIP มี **เฉพาะไฟล์ที่เปลี่ยน** พร้อมคำแนะนำว่าจะวางทับที่ใด
- [ ] ห้าม Commit service_role key, credentials, .env, token และข้อมูลผู้ใช้จริง

## รูปแบบบันทึก Changelog

```markdown
## [8.8.1] — YYYY-MM-DD — Short Title

**Why:** ปัญหาเดิมหรือเหตุผลที่เพิ่มฟีเจอร์

**Added:** ...
**Changed:** ...
**Fixed:** ...
**Database:** No / Migration `<file>` (run once)
**Compatibility:** Guest / Login / Cache / Legacy data
**Verification:** Syntax + manual regression + staging status
```

## Deploy อย่างปลอดภัย

1. Backup และจดเวอร์ชันปัจจุบัน
2. รัน SQL ใหม่ **เฉพาะเมื่อคู่มือระบุว่าจำเป็น** ห้ามนำไฟล์ SQL เก่าทั้งโฟลเดอร์ไปรันซ้ำ
3. Deploy frontend หลัง SQL พร้อม หาก SQL ล้มเหลวให้หยุด ไม่ Deploy ส่วนที่ต้องพึ่ง RPC ใหม่
4. รีเฟรชและตรวจ Version/Cache
5. ใช้บัญชีทดสอบก่อนเปิดให้ User ทุกคน
6. เก็บผลตรวจและหมายเหตุไว้ใน Release Notes

## Rollback

- สำหรับรุ่นเปลี่ยนเลขเวอร์ชันและเอกสารเท่านั้น สามารถคืน Frontend รุ่นก่อนจาก Backup/Commit แล้ว Deploy ใหม่
- อย่า Rollback Database โดยเดา ให้ดู Backup/Migration และผลธุรกรรมใหม่ที่เกิดขึ้นหลัง Deploy ก่อน
- ห้ามลบ LocalStorage เพื่อแก้ Cache เพราะอาจลบประวัติหุ้นและข้อมูล Guest ที่ยังไม่ได้กู้
