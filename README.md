# Empire MD WhatsApp Bot 🚀

Halo kalian! Ini adalah **Empire MD**, base WhatsApp bot terbaru yang simple tapi powerfull.  
Repo ini cocok banget buat kalian yang pengen belajar atau langsung pakai bot Empire MD sendiri.  

Dibangun dengan **Baileys MD (Multi-Device)** dan sudah dioptimalkan supaya:

- ✅ Support **LID (Linked Device ID)** terbaru  
- ✅ Fix detect **Admin & Bot Admin** (gaada false detect lagi)  
- ✅ Database simple (mudah dipahami & edit manual)  
- ✅ Command mudah dipahami & gampang dikembangkan  
- ✅ Struktur kode clean buat belajar  

---

## ✨ Fitur Utama
- 👋 Welcome & Leave Message  
- 🔗 Antilink Grup (kick/hapus pesan otomatis)  
- 🚫 Group Only Mode (bot hanya bisa dipakai di grup jika diaktifkan)  
- 📂 JSON Database (ga ribet setup DB)  
- ⚡ Auto detect admin & bot admin (support LID)  

---

## 📥 Instalasi
Clone repo ini ke lokal atau server kamu:

```bash
git clone https://github.com/your-username/empire-md.git
```

---

## ▶️ Menjalankan Bot
```bash
npm install
npm start
```

Masukkan pairing code sesuai instruksi di terminal.  
Kalau berhasil, bot langsung online 🚀  

---

## 🛠️ Cara Setting
- **Welcome**  
  Aktifkan: `.welcome on`  
  Matikan: `.welcome off`  

- **Antilink**  
  Aktifkan: `.antilink on`  
  Matikan: `.antilink off`  

- **Group Only Mode**  
  Aktifkan: `.gconly on` → bot cuma bisa dipakai di grup  
  Matikan: `.gconly off` → bot bisa dipakai di grup & private  

- **WhatsApp Account Helpers**
  - Check ban status: `.cekban 234xxxxxxxxxx`
  - Send an appeal email: `.unban 234xxxxxxxxxx | Owner Name`
  - Free mail mode: `UNBAN_MAIL_PROVIDER=guerrilla`
  - Optional Guerrilla Mail sender name: `GUERRILLA_EMAIL_USER=empiremd`
  - Optional recipients: `UNBAN_RECIPIENTS=email1,email2`
  - SMTP mode is still available with `UNBAN_MAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - Open tool hub: `.tools`

- **Telegram Pairing**
  - Set `TELEGRAM_BOT_TOKEN` before starting the bot.
  - Telegram commands: `/addbot +234xxxxxxxxxx`, `/mybots`, `/delbot +234xxxxxxxxxx`, `/delallbots`.
  - Linked sessions are saved in `Session/linked/<telegram_user_id>/<phone_number>`.

---

## 👨‍💻 Contributing
Base ini simple, friendly, dan open untuk dikembangkan.  
Kalau ada ide fitur baru, feel free buat fork & pull request 😎  

---

## 📜 License
MIT License © 2025  
Boleh dipakai bebas, tapi jangan lupa kasih kredit 😉  

---

🔥 Jadi tunggu apa lagi?  
Yuk langsung coba **Empire MD WhatsApp Bot** ini dan kembangkan jadi bot andalan kamu!  
