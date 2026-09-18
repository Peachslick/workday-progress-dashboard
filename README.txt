WORKDAY PROGRESS DASHBOARD V4.1 - ATTENDANCE & TIME BALANCE
=========================================================

Workday Progress Dashboard - Version 4.0
Smart Journey / Heatmap / Replay / PWA
========================================

ภาพรวม
------
Dashboard ส่วนตัวสำหรับติดตามเวลาทำงานและเส้นทางการฝึกงาน
ช่วงฝึกงานเริ่มต้น 05/05/2026 ถึง 30/10/2026
ทำงานวันจันทร์-ศุกร์ เวลา 07:00-16:10
เวลาทำงานจริง 8 ชั่วโมงต่อวัน โดยไม่นับเวลาพัก

วิธีเปิดแบบปกติ
----------------
1) แตกไฟล์ ZIP
2) ดับเบิลคลิก start-dashboard.bat
3) ถ้ายังไม่มี Sarabun ใน Project สามารถกด Y เพื่อดาวน์โหลดครั้งแรกได้
4) หลัง Setup Font แล้วสามารถเปิด index.html แบบ Offline ได้ตามปกติ

วิธีเปิด PWA บนเครื่องตัวเอง
-----------------------------
1) ต้องมี Node.js
2) ดับเบิลคลิก start-pwa-local.bat
3) Browser จะเปิด http://localhost:4173
4) โหมดนี้ใช้ทดสอบ Install App / Service Worker / Notification ได้

ไม่ต้อง npm install และไม่มี package dependency ใด ๆ

Deploy ขึ้น Vercel / Netlify / GitHub Pages
--------------------------------------------
อัปโหลดไฟล์ในโฟลเดอร์นี้ทั้งหมดได้เลย เพราะเป็น Static Website
เมื่อเปิดผ่าน HTTPS:
- Service Worker จะทำงาน
- Browser ที่รองรับสามารถ Install เป็น PWA ได้
- Smart Notifications สามารถขอ Permission ได้
- Sarabun มี Google Fonts online fallback หากไม่มี Local Font

หมายเหตุ: Smart Notifications ใน V4 เป็นการแจ้งเตือนจาก Logic ของหน้าเว็บ
ดังนั้นหน้าเว็บหรือ PWA ต้องกำลังเปิดอยู่ จึงจะตรวจเวลาและส่ง Notification ได้
ไม่ได้ใช้ Push Server หรือ Backend จึงไม่แจ้งเตือนเมื่อ App ถูกปิดทั้งหมด

เวลาทำงาน
---------
- Work 1: 07:00-09:00
- Break 1: 09:00-09:20
- Work 2: 09:20-11:00
- Break 2: 11:00-11:40
- Work 3: 11:40-14:00
- Break 3: 14:00-14:10
- Work 4: 14:10-16:10
- Working time: 480 minutes / day
- Break time: 70 minutes / day

Version 4.0 - New Functions
----------------------------
[Future Milestone Predictor]
- ทำนายวันและเวลาของ 100 / 250 / 500 / 750 / 800 / 900 / 1,000 ชั่วโมง
- แสดงเป้าหมายสุดท้ายตาม Planned Hours จริง
- คำนวณผ่าน Break, Weekend, Holiday, Leave และ Special Working Day
- Calendar override เปลี่ยนเมื่อไร Forecast จะคำนวณใหม่ทันที

[Time Machine / Day Replay]
- เลือกวันที่ในช่วงฝึกงาน
- ลาก Slider ตั้งแต่ 07:00 ถึง 16:10
- ดู Progress, Worked Time, Remaining Time และ Status ณ เวลาที่จำลอง
- ปุ่ม Now กลับสู่เวลาปัจจุบันแบบ Real-time

[Internship Heatmap]
- มอง Journey ตั้งแต่ May ถึง October ในภาพเดียว
- ความเข้มของสีแสดงจำนวนชั่วโมงที่ทำงาน
- Today / Future / Weekend / Holiday / Leave / Special Work แยกสถานะ
- Hover เพื่อดูรายละเอียดของวันนั้น

[Journey Snapshot]
- ปุ่ม Create Snapshot สร้าง PNG ขนาด 1600x900
- สรุป Total Hours, Workdays, Progress, Achievements, Streak และ Next Milestone
- ใช้เก็บเป็น Portfolio หรือแชร์ได้
- เมื่อจบฝึกงานมี Final Snapshot แยกต่างหาก

[Smart Notifications]
เปิดจาก Settings และอนุญาต Notification ของ Browser
- Break in 5 minutes
- Back to work หลัง Break
- 1 working hour left
- Workday Complete
- แต่ละ Event แจ้งครั้งเดียวต่อวัน

[PWA]
- manifest.webmanifest
- service-worker.js
- App icons 192 / 512
- Install App button จะแสดงเมื่อ Browser พร้อมติดตั้ง
- Core files มี Offline cache
- มี Online / Offline indicator

[Dynamic Dashboard Mood]
- Morning / Midday / Afternoon / Evening atmosphere
- Break mood
- Finished mood
- ปิดได้จาก Settings

[Trophy Room / Achievement Showcase]
- Achievement เดิมทั้งหมดอยู่ใน Trophy Room
- Card ที่ปลดล็อกมี Highlight / Shine effect
- แสดงวันที่ปลดล็อก หรือวันที่คาดว่าจะปลดล็อก

[Journey Story]
- Timeline เรื่องราวจาก The Beginning จนถึง Internship Completed
- แสดง Reached / Next / Upcoming
- วันที่ของแต่ละ Milestone คำนวณจากตารางจริง

[Dynamic Browser Tab]
Title ของ Browser เปลี่ยนตามสถานะ เช่น
- 62.5% / เวลาที่เหลือ
- Break / เวลาพักที่เหลือ
- Workday Complete
- Day Off

[Final Internship Report Card]
เมื่อ Progress ถึง 100%
- Journey Complete mode
- Total Hours
- Workdays
- Weeks
- Achievements
- Confetti
- Create Final Snapshot

Functions จาก Version 3 ยังอยู่ครบ
-------------------------------
- Daily Progress 8 ชั่วโมง
- Break ไม่นับ Progress
- Live Countdown
- Daily Milestone 25/50/75/100%
- Today Schedule
- Weekly Progress
- Internship Progress
- Total Work Time / Minutes
- Current / Longest Work Streak
- Monthly Statistics
- Calendar Holiday / Leave / Special Work
- Achievement Popup
- TH / EN
- Light / Dark / System
- Sarabun / Font Settings
- Font Size
- 12 / 24 hour
- Show Seconds
- Animation On / Off
- Comfortable / Compact Layout

ข้อมูลที่บันทึกใน Browser
-------------------------
- Language / Theme / Font / Layout settings
- Calendar overrides
- Achievement history
- Smart Notification preference
- Dynamic Mood preference
- Completion status

ข้อมูลเหล่านี้ใช้ localStorage ดังนั้นคนอื่นที่เปิด URL เดียวกัน
จะเริ่มจาก Default ของ Browser ตัวเอง และจะไม่เห็น localStorage ของคุณ

Sarabun Font
------------
เพื่อไม่ให้ Project ผูกกับ Font ที่ติดตั้งใน Windows มี 2 วิธี:
1) Local/Offline: ใช้ setup-sarabun-font.bat ดาวน์โหลด Sarabun มาไว้ใน assets/fonts
2) Vercel/Online: หน้าเว็บมี Google Fonts fallback สำหรับ Sarabun

ไฟล์ Font ไม่ได้ถูกบรรจุใน ZIP นี้โดยตรง

ไฟล์สำคัญ
---------
index.html
styles.css
app.js
manifest.webmanifest
service-worker.js
local-server.js
start-dashboard.bat
start-pwa-local.bat
setup-sarabun-font.bat
setup-sarabun-font.ps1
assets/icons/icon-192.png
assets/icons/icon-512.png


========================================
V4.1 - ATTENDANCE, LEAVE & TIME BALANCE
========================================
- Personal Leave now stays in the scheduled hours and is tracked as lost time.
- Leave can be Full Day (8h), Half Day (4h), or Custom hours/minutes.
- Company Holiday is excluded from planned time and is NOT counted as lost time.
- Compensatory Workday is counted as a normal 8-hour scheduled workday.
- Added Expected Hours by Today, Actual Work Hours, Time Balance, and Attendance %.
- Added Leave Time Lost, Company Holiday count, and Compensatory Work statistics.
- Monthly Statistics, Heatmap, Milestone forecast, Snapshot and Final Report use the new attendance logic.
- Existing V4 calendar data remains compatible: old Leave entries are treated as Full Day leave; old Special Workday entries are treated as Compensatory Workdays.
