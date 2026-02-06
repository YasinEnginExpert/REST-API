package sqlconnect

import (
	"database/sql"
	"restapi/internal/models"
	pkgutils "restapi/pkg/utils"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) GetAll(limit int, offset int) ([]models.User, error) {
	query := "SELECT id, first_name, last_name, email, username, user_created_at, inactive_status, role, last_login, mfa_enabled FROM users LIMIT $1 OFFSET $2"
	rows, err := r.DB.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		var firstName, lastName sql.NullString
		var userCreatedAt, lastLogin sql.NullTime
		if err := rows.Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &userCreatedAt, &u.InactiveStatus, &u.Role, &lastLogin, &u.MFAEnabled); err != nil {
			return nil, err
		}
		u.FirstName = firstName.String
		u.LastName = lastName.String
		u.UserCreatedAt = formatNullTime(userCreatedAt)
		u.LastLogin = formatNullTime(lastLogin)
		users = append(users, u)
	}
	return users, nil
}

func (r *UserRepository) Count() (int, error) {
	var count int
	err := r.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	return count, err
}

func (r *UserRepository) Create(u models.User) (*models.User, error) {
	// Hash the password if provided
	if u.Password != "" {
		hashed, err := pkgutils.HashPassword(u.Password)
		if err != nil {
			return nil, err
		}
		u.Password = hashed
	}

	query := `INSERT INTO users (first_name, last_name, email, username, password, role, inactive_status, mfa_enabled) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, user_created_at`
	var userCreatedAt sql.NullTime
	err := r.DB.QueryRow(query, u.FirstName, u.LastName, u.Email, u.Username, u.Password, u.Role, u.InactiveStatus, u.MFAEnabled).Scan(&u.ID, &userCreatedAt)
	if err != nil {
		return nil, err
	}
	u.UserCreatedAt = formatNullTime(userCreatedAt)
	return &u, nil
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	var u models.User
	var firstName, lastName sql.NullString
	var userCreatedAt, lastLogin sql.NullTime

	query := "SELECT id, first_name, last_name, email, username, user_created_at, inactive_status, role, last_login, mfa_enabled FROM users WHERE id=$1"
	err := r.DB.QueryRow(query, id).Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &userCreatedAt, &u.InactiveStatus, &u.Role, &lastLogin, &u.MFAEnabled)
	if err != nil {
		return nil, err
	}

	u.FirstName = firstName.String
	u.LastName = lastName.String
	u.UserCreatedAt = formatNullTime(userCreatedAt)
	u.LastLogin = formatNullTime(lastLogin)
	return &u, nil
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	var u models.User
	var firstName, lastName sql.NullString
	var userCreatedAt, lastLogin sql.NullTime

	query := "SELECT id, first_name, last_name, email, username, password, user_created_at, inactive_status, role, last_login, mfa_enabled FROM users WHERE username=$1"
	err := r.DB.QueryRow(query, username).Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &u.Password, &userCreatedAt, &u.InactiveStatus, &u.Role, &lastLogin, &u.MFAEnabled)
	if err != nil {
		return nil, err
	}

	u.FirstName = firstName.String
	u.LastName = lastName.String
	u.UserCreatedAt = formatNullTime(userCreatedAt)
	u.LastLogin = formatNullTime(lastLogin)
	return &u, nil
}

func (r *UserRepository) Update(u models.User) (int64, error) {
	query := `UPDATE users SET first_name=$1, last_name=$2, email=$3, username=$4, role=$5, inactive_status=$6, mfa_enabled=$7 
			  WHERE id=$8`

	res, err := r.DB.Exec(query, u.FirstName, u.LastName, u.Email, u.Username, u.Role, u.InactiveStatus, u.MFAEnabled, u.ID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (r *UserRepository) Delete(id string) (int64, error) {
	query := "DELETE FROM users WHERE id=$1"
	res, err := r.DB.Exec(query, id)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

// UpdatePassword updates the user's password with a hashed version
func (r *UserRepository) UpdatePassword(id string, newPassword string) error {
	hashed, err := pkgutils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	query := "UPDATE users SET password=$1, password_changed_at=CURRENT_TIMESTAMP WHERE id=$2"
	_, err = r.DB.Exec(query, hashed, id)
	return err
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var u models.User
	var firstName, lastName sql.NullString
	var userCreatedAt, lastLogin sql.NullTime

	query := "SELECT id, first_name, last_name, email, username, password, user_created_at, inactive_status, role, last_login, mfa_enabled FROM users WHERE email=$1"
	err := r.DB.QueryRow(query, email).Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &u.Password, &userCreatedAt, &u.InactiveStatus, &u.Role, &lastLogin, &u.MFAEnabled)
	if err != nil {
		return nil, err
	}

	u.FirstName = firstName.String
	u.LastName = lastName.String
	u.UserCreatedAt = formatNullTime(userCreatedAt)
	u.LastLogin = formatNullTime(lastLogin)
	return &u, nil
}

func (r *UserRepository) SetPasswordResetCode(id string, code string) error {
	query := "UPDATE users SET password_reset_code=$1 WHERE id=$2"
	_, err := r.DB.Exec(query, code, id)
	return err
}

func (r *UserRepository) GetByResetCode(code string) (*models.User, error) {
	var u models.User
	var firstName, lastName sql.NullString
	var userCreatedAt sql.NullTime

	query := "SELECT id, first_name, last_name, email, username, password, user_created_at, inactive_status, role, mfa_enabled FROM users WHERE password_reset_code=$1"
	err := r.DB.QueryRow(query, code).Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &u.Password, &userCreatedAt, &u.InactiveStatus, &u.Role, &u.MFAEnabled)
	if err != nil {
		return nil, err
	}

	u.FirstName = firstName.String
	u.LastName = lastName.String
	u.UserCreatedAt = formatNullTime(userCreatedAt)
	return &u, nil
}

// ResetPassword updates the password and clears the reset code atomically
func (r *UserRepository) ResetPassword(id string, newPassword string) error {
	hashed, err := pkgutils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	query := "UPDATE users SET password=$1, password_changed_at=CURRENT_TIMESTAMP, password_reset_code=NULL WHERE id=$2"
	_, err = r.DB.Exec(query, hashed, id)
	return err
}
