package mailer

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"path/filepath"
	"restapi/internal/config"
)

type Mailer struct {
	server   string
	port     int
	username string
	password string
	sender   string
}

func New(cfg config.SMTPConfig) *Mailer {
	return &Mailer{
		server:   cfg.Host,
		port:     cfg.Port,
		username: cfg.Username,
		password: cfg.Password,
		sender:   cfg.Sender,
	}
}

func (m *Mailer) Send(to, subject, templateName string, data interface{}) error {
	tmplPathHTML := filepath.Join("internal", "mailer", "templates", templateName+".html.gohtml")
	tmplPathPlain := filepath.Join("internal", "mailer", "templates", templateName+".plain.gohtml")

	// Parse HTML template
	tHTML, err := template.ParseFiles(tmplPathHTML)
	if err != nil {
		return fmt.Errorf("parsing html template: %w", err)
	}
	var bodyHTML bytes.Buffer
	if err := tHTML.ExecuteTemplate(&bodyHTML, "body", data); err != nil {
		return fmt.Errorf("executing html template: %w", err)
	}

	// Parse Plain template
	tPlain, err := template.ParseFiles(tmplPathPlain)
	if err != nil {
		return fmt.Errorf("parsing plain template: %w", err)
	}
	var bodyPlain bytes.Buffer
	if err := tPlain.ExecuteTemplate(&bodyPlain, "body", data); err != nil {
		return fmt.Errorf("executing plain template: %w", err)
	}

	// Construct Multipart Message
	boundary := "mixed-boundary-12345"
	headers := make(map[string]string)
	headers["From"] = m.sender
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "multipart/alternative; boundary=" + boundary

	msg := ""
	for k, v := range headers {
		msg += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	msg += "\r\n"

	// Plain Text Part
	msg += fmt.Sprintf("--%s\r\n", boundary)
	msg += "Content-Type: text/plain; charset=UTF-8\r\n\r\n"
	msg += bodyPlain.String()
	msg += "\r\n"

	// HTML Part
	msg += fmt.Sprintf("--%s\r\n", boundary)
	msg += "Content-Type: text/html; charset=UTF-8\r\n\r\n"
	msg += bodyHTML.String()
	msg += "\r\n"

	msg += fmt.Sprintf("--%s--", boundary)

	// Send email
	addr := fmt.Sprintf("%s:%d", m.server, m.port)

	var auth smtp.Auth
	if m.username != "" {
		auth = smtp.PlainAuth("", m.username, m.password, m.server)
	}

	err = smtp.SendMail(addr, auth, m.sender, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("sending email: %w", err)
	}

	return nil
}
