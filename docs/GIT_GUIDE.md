# Profesyonel Git Kullanım Rehberi

Bu doküman, proje geliştirme sürecinde uyulması gereken Git standartlarını, iş akışlarını ve sık kullanılan komutları içerir. Profesyonel bir yazılım ekibinin ortak dili Git'tir.

## 1. Kurulum ve Yapılandırma (İlk Seferlik)

Kimliğinizi tanıtın (Commit'lerde görünür):
```bash
git config --global user.name "Adınız Soyadınız"
git config --global user.email "email@adresiniz.com"
```

Satır sonu karakterleri hatasını (CRLF) önlemek için (Windows):
```bash
git config --global core.autocrlf true
```

## 2. Standart İş Akışı (The Loop)

Güne başlarken veya çalışmaya başlamadan önce **mutlaka**:
```bash
git pull origin main
```

### Değişiklikleri Kaydetme Döngüsü:
1.  **Durumu Gör:** `git status`
2.  **Dosyaları Ekle:**
    *   Hepsini: `git add .`
    *   Tek tek: `git add dosya.go`
3.  **Kaydet (Commit):** `git commit -m "feat: login handler eklendi"`
4.  **Gönder (Push):** `git push origin feature/branch-adi`

---

## 3. Branch (Dal) Stratejisi

Profesyonel ortamda **asla** `main` branch'ine doğrudan commit atılmaz.

### Yeni Bir Özellik İçin:
1.  `main` branch'ine geç ve güncelle:
    ```bash
    git checkout main
    git pull
    ```
2.  Yeni branch aç (İsimlendirme standardına uy):
    ```bash
    git checkout -b feature/kullanici-girisi
    # veya hata düzeltmesi için:
    git checkout -b fix/database-baglantisi
    ```
3.  Çalışmalarını bu branch'te yap, commit'le ve push'la.

### Branch İsimlendirme Standartları:
*   `feature/...`: Yeni özellikler (örn: `feature/email-notifications`)
*   `fix/...`: Hata düzeltmeleri (örn: `fix/login-error`)
*   `refactor/...`: Kod iyileştirmeleri (örn: `refactor/api-routes`)
*   `docs/...`: Dokümantasyon (örn: `docs/readme-update`)

---

## 4. Commit Mesajı Standartları (Conventional Commits)

Commit mesajları `tür: açıklama` formatında olmalıdır.

*   **feat:** Yeni bir özellik (feature).
    *   `feat: kullanıcı kayıt endpoint'i eklendi`
*   **fix:** Bir hatanın düzeltilmesi.
    *   `fix: jwt token süresi hatası giderildi`
*   **docs:** Sadece dokümantasyon değişikliği.
    *   `docs: README dosyasına kurulum adımları eklendi`
*   **style:** Kod formatlaması (boşluk, virgül vs. - kod mantığı değişmez).
    *   `style: gofmt uygulandı`
*   **refactor:** Ne hata düzelten ne de özellik ekleyen kod değişikliği.
    *   `refactor: veritabanı bağlantı fonksiyonu sadeleştirildi`
*   **chore:** Build süreci, kütüphane güncellemeleri vb.
    *   `chore: go.mod bağımlılıkları güncellendi`

---

## 5. İleri Seviye ve Kurtarıcı Komutlar

### Stash (Geçici Saklama)
Çalışırken acil başka bir işe bakmanız gerekti ama commit atmak istemiyorsunuz:
```bash
git stash        # Değişiklikleri rafa kaldır (dosyalar temizlenir)
# ... başka işleri hallet ...
git stash pop    # Rafa kaldırdıklarını geri getir
```

### Log ve Geçmiş
```bash
git log --oneline --graph --all  # Ağaç yapısında özet geçmiş
git blame main.go                # "Bu satırı kim yazdı?" (Satır satır yazar bilgisi)
```

### Değişiklikleri Geri Alma
*   **Değişiklikleri İptal Et (Son commit'ten sonraki):**
    ```bash
    git restore ana_sunucu.go
    ```
*   **Yanlışlıkla `git add` yaptığın dosyayı geri çek:**
    ```bash
    git restore --staged ana_sunucu.go
    ```
*   **Son Commit'i Geri Al (Dosyalar silinmez, korur):**
    ```bash
    git reset --soft HEAD~1
    ```
*   **Son Commit'i ve Değişiklikleri TAMAMEN sil (DİKKAT!):**
    ```bash
    git reset --hard HEAD~1
    ```

---

## 6. .gitignore Nedir?
Projede `.gitignore` dosyası, Git'in takip etmemesi gereken dosyaları belirtir.
*   **Eklenmesi gerekenler:**
    *   Derleme çıktıları (`/bin`, `.exe`)
    *   Kişisel IDE ayarları (`.vscode`, `.idea`)
    *   Hassas veriler/Şifreler (`certs/*.key`, `.env`)
    *   Geçici dosyalar (`tmp/`, `*.log`)

Bu dosya projenin kök dizininde bulunur ve repoya commit edilmelidir.
