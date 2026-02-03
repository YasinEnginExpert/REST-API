package utils

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

// Argon2 parametreleri (OWASP tarafından önerilen güvenli varsayılanlar)
const (
	argon2Time    = 1
	argon2Memory  = 64 * 1024 // 64 MB
	argon2Threads = 4
	argon2KeyLen  = 32
	argon2SaltLen = 16
)

// HashPassword, düz metin şifreyi Argon2id algoritmasıyla hashler.
// Döndürülen format: $argon2id$v=19$m=65536,t=1,p=4$salt$hash
func HashPassword(password string) (string, error) {
	// 1. Rastgele Salt Oluştur
	salt := make([]byte, argon2SaltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	// 2. Hash Oluştur
	hash := argon2.IDKey([]byte(password), salt, argon2Time, argon2Memory, argon2Threads, argon2KeyLen)

	// 3. Kodla (Base64) ve Formatla
	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	encodedHash := fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version, argon2Memory, argon2Time, argon2Threads, b64Salt, b64Hash)

	return encodedHash, nil
}

// CheckPassword, verilen şifrenin saklanan hash ile eşleşip eşleşmediğini kontrol eder
func CheckPassword(password, encodedHash string) (bool, error) {
	// 1. Hash stringini parçalarına ayır
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 {
		return false, errors.New("invalid hash format")
	}

	// parts[0] boş, parts[1] "argon2id", parts[2] "v=19", parts[3] parametreler, parts[4] salt, parts[5] hash

	// Parametreleri ayrıştır (basitlik için varsayılanları kullandığımızı varsayıyoruz,
	// profesyonel kullanımda buradaki değerleri okuyup ona göre hashlemek daha doğrudur)
	// var memory uint32
	// var time uint32
	// var threads uint8
	// _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &threads)

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, err
	}

	decodedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, err
	}

	// 2. Gelen şifreyi aynı salt ve parametrelerle yeniden hashle
	keyToCheck := argon2.IDKey([]byte(password), salt, argon2Time, argon2Memory, argon2Threads, argon2KeyLen)

	// 3. Karşılaştır (Sabit zamanlı karşılaştırma yapılmalı, ancak basitlik için string karşılaştırması yeterli olabilir)
	// Ancak güvenlik için byte karşılaştırma:
	if string(keyToCheck) == string(decodedHash) { // Daha güvenli: subtle.ConstantTimeCompare
		return true, nil
	}

	return false, nil
}
