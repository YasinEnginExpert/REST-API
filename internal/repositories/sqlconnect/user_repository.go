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

func (r *UserRepository) GetAll() ([]models.User, error) {
	query := "SELECT id, first_name, last_name, email, username, password, user_created_at, inactive_status, role FROM users"
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		var firstName, lastName sql.NullString
		if err := rows.Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &u.Password, &u.UserCreatedAt, &u.InactiveStatus, &u.Role); err != nil {
			return nil, err
		}
		u.FirstName = firstName.String
		u.LastName = lastName.String
		users = append(users, u)
	}
	return users, nil
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

	query := `INSERT INTO users (first_name, last_name, email, username, password, role, inactive_status) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, user_created_at`

	err := r.DB.QueryRow(query, u.FirstName, u.LastName, u.Email, u.Username, u.Password, u.Role, u.InactiveStatus).Scan(&u.ID, &u.UserCreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	var u models.User
	var firstName, lastName sql.NullString

	query := "SELECT id, first_name, last_name, email, username, user_created_at, inactive_status, role FROM users WHERE id=$1"
	err := r.DB.QueryRow(query, id).Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &u.UserCreatedAt, &u.InactiveStatus, &u.Role)
	if err != nil {
		return nil, err
	}

	u.FirstName = firstName.String
	u.LastName = lastName.String
	return &u, nil
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	var u models.User
	var firstName, lastName sql.NullString

	query := "SELECT id, first_name, last_name, email, username, password, user_created_at, inactive_status, role FROM users WHERE username=$1"
	err := r.DB.QueryRow(query, username).Scan(&u.ID, &firstName, &lastName, &u.Email, &u.Username, &u.Password, &u.UserCreatedAt, &u.InactiveStatus, &u.Role)
	if err != nil {
		return nil, err
	}

	u.FirstName = firstName.String
	u.LastName = lastName.String
	return &u, nil
}

func (r *UserRepository) Update(u models.User) (int64, error) {
	query := `UPDATE users SET first_name=$1, last_name=$2, email=$3, username=$4, role=$5, inactive_status=$6 
			  WHERE id=$7`

	res, err := r.DB.Exec(query, u.FirstName, u.LastName, u.Email, u.Username, u.Role, u.InactiveStatus, u.ID)
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
