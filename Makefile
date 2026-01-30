run:
	go run cmd/api/main.go

build:
	go build -o bin/api.exe cmd/api/main.go

gen-certs:
	@echo "Creating CA..."
	openssl genrsa -out certs/ca.key 2048
	openssl req -x509 -new -nodes -key certs/ca.key -sha256 -days 1825 -out certs/ca.pem -subj "//C=TR/ST=Samsun/L=Samsun/O=MyDevRootCA/CN=MyDevRootCA"
	
	@echo "Creating Server Key and CSR..."
	openssl genrsa -out certs/key.pem 2048
	openssl req -new -key certs/key.pem -out certs/server.csr -config certs/openssl.conf
	
	@echo "Signing Server Certificate..."
	openssl x509 -req -in certs/server.csr -CA certs/ca.pem -CAkey certs/ca.key -CAcreateserial -out certs/cert.pem -days 365 -sha256 -extfile certs/openssl.conf -extensions v3_req

	@echo "Creating Client Key and CSR..."
	openssl genrsa -out certs/client.key 2048
	openssl req -new -key certs/client.key -out certs/client.csr -subj "//C=TR/ST=Samsun/L=Samsun/O=MyDevClient/CN=MyDevClient"

	@echo "Signing Client Certificate..."
	openssl x509 -req -in certs/client.csr -CA certs/ca.pem -CAkey certs/ca.key -CAcreateserial -out certs/client.pem -days 365 -sha256 -extfile certs/openssl.conf -extensions v3_req

	@echo "Creating Client PFx for Postman/Browser (Password: changeit)..."
	openssl pkcs12 -export -out certs/client.p12 -inkey certs/client.key -in certs/client.pem -passout pass:changeit

	@echo "Done! Import certs/ca.pem to your Trusted Root Store."
