package utils

import (
	"crypto/rand"
	"math/big"
)

// GenerateRandomCode generates a numeric code of given length
func GenerateRandomCode(length int) (string, error) {
	const digits = "0123456789"
	ret := make([]byte, length)
	for i := 0; i < length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		ret[i] = digits[num.Int64()]
	}
	return string(ret), nil
}
