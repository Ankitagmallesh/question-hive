package models

import (
	"time"

	"gorm.io/gorm"
)

// Base model with common fields
type BaseModel struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// User model for authentication and user management
type User struct {
	BaseModel
	Email         string     `gorm:"uniqueIndex;not null" json:"email" validate:"required,email"`
	Name          string     `gorm:"not null" json:"name" validate:"required"`
	Password      string     `gorm:"not null" json:"-" validate:"required,min=6"`
	Role          string     `gorm:"default:professor" json:"role" validate:"oneof=admin professor"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
	LastLoginAt   *time.Time `json:"last_login_at"`
	InstitutionID *uint      `json:"institution_id"`
	Institution   *Institution `gorm:"foreignKey:InstitutionID" json:"institution,omitempty"`
	
	// Relationships
	Questions     []Question     `gorm:"foreignKey:CreatedBy" json:"questions,omitempty"`
	QuestionPapers []QuestionPaper `gorm:"foreignKey:CreatedBy" json:"question_papers,omitempty"`
}

// Institution model for multi-tenancy
type Institution struct {
	BaseModel
	Name        string `gorm:"not null" json:"name" validate:"required"`
	Code        string `gorm:"uniqueIndex;not null" json:"code" validate:"required"`
	Type        string `gorm:"default:college" json:"type" validate:"oneof=school college university"`
	Address     string `json:"address"`
	ContactEmail string `json:"contact_email" validate:"omitempty,email"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`
	
	// Relationships
	Users []User `gorm:"foreignKey:InstitutionID" json:"users,omitempty"`
}

// Exam types (JEE, NEET, CET, etc.)
type Exam struct {
	BaseModel
	Name        string `gorm:"not null" json:"name" validate:"required"`
	Code        string `gorm:"uniqueIndex;not null" json:"code" validate:"required"`
	Description string `json:"description"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`
	
	// Relationships
	Subjects []Subject `gorm:"foreignKey:ExamID" json:"subjects,omitempty"`
}

// Subject model (Mathematics, Physics, Chemistry, etc.)
type Subject struct {
	BaseModel
	Name        string `gorm:"not null" json:"name" validate:"required"`
	Code        string `gorm:"not null" json:"code" validate:"required"`
	Description string `json:"description"`
	ExamID      uint   `gorm:"not null" json:"exam_id"`
	Exam        Exam   `gorm:"foreignKey:ExamID" json:"exam,omitempty"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`
	
	// Relationships
	Chapters  []Chapter  `gorm:"foreignKey:SubjectID" json:"chapters,omitempty"`
	Questions []Question `gorm:"foreignKey:SubjectID" json:"questions,omitempty"`
}

// Chapter model for detailed topic organization
type Chapter struct {
	BaseModel
	Name        string  `gorm:"not null" json:"name" validate:"required"`
	Code        string  `gorm:"not null" json:"code" validate:"required"`
	Description string  `json:"description"`
	Weightage   float64 `gorm:"default:1.0" json:"weightage"` // For question paper generation
	SubjectID   uint    `gorm:"not null" json:"subject_id"`
	Subject     Subject `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
	IsActive    bool    `gorm:"default:true" json:"is_active"`
	
	// Relationships
	Questions []Question `gorm:"foreignKey:ChapterID" json:"questions,omitempty"`
}

// Question model - core entity for question bank
type Question struct {
	BaseModel
	Content     string `gorm:"type:text;not null" json:"content" validate:"required"`
	Type        string `gorm:"not null" json:"type" validate:"required,oneof=mcq numerical descriptive true_false fill_blank"`
	Difficulty  string `gorm:"not null" json:"difficulty" validate:"required,oneof=easy medium hard"`
	Marks       int    `gorm:"default:1" json:"marks" validate:"min=1"`
	
	// Academic organization
	SubjectID uint    `gorm:"not null" json:"subject_id"`
	Subject   Subject `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
	ChapterID uint    `gorm:"not null" json:"chapter_id"`
	Chapter   Chapter `gorm:"foreignKey:ChapterID" json:"chapter,omitempty"`
	
	// Options for MCQ questions (JSON array)
	Options     string `gorm:"type:text" json:"options,omitempty"` // JSON array for MCQ options
	CorrectAnswer string `gorm:"type:text" json:"correct_answer,omitempty"`
	Explanation   string `gorm:"type:text" json:"explanation,omitempty"`
	
	// Metadata
	CreatedBy   uint `gorm:"not null" json:"created_by"`
	Creator     User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	IsActive    bool `gorm:"default:true" json:"is_active"`
	IsAIGenerated bool `gorm:"default:false" json:"is_ai_generated"`
	
	// Analytics
	UsageCount int `gorm:"default:0" json:"usage_count"`
	
	// Relationships
	QuestionPaperItems []QuestionPaperItem `gorm:"foreignKey:QuestionID" json:"question_paper_items,omitempty"`
}

// Question Paper model
type QuestionPaper struct {
	BaseModel
	Title         string    `gorm:"not null" json:"title" validate:"required"`
	Description   string    `json:"description"`
	ExamDate      *time.Time `json:"exam_date"`
	Duration      int       `json:"duration"` // in minutes
	TotalMarks    int       `gorm:"default:0" json:"total_marks"`
	Instructions  string    `gorm:"type:text" json:"instructions"`
	
	// Academic info
	SubjectID uint    `gorm:"not null" json:"subject_id"`
	Subject   Subject `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
	
	// Metadata
	CreatedBy uint `gorm:"not null" json:"created_by"`
	Creator   User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	IsActive  bool `gorm:"default:true" json:"is_active"`
	Status    string `gorm:"default:draft" json:"status" validate:"oneof=draft published archived"`
	
	// Relationships
	Items []QuestionPaperItem `gorm:"foreignKey:QuestionPaperID" json:"items,omitempty"`
}

// Question Paper Item - junction table for questions in papers
type QuestionPaperItem struct {
	BaseModel
	QuestionPaperID uint         `gorm:"not null" json:"question_paper_id"`
	QuestionPaper   QuestionPaper `gorm:"foreignKey:QuestionPaperID" json:"question_paper,omitempty"`
	QuestionID      uint         `gorm:"not null" json:"question_id"`
	Question        Question     `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
	OrderIndex      int          `gorm:"not null" json:"order_index"` // Position in paper
	Marks           int          `gorm:"not null" json:"marks"`        // Marks for this question in this paper
}

// Question Usage Analytics
type QuestionUsage struct {
	BaseModel
	QuestionID      uint     `gorm:"not null" json:"question_id"`
	Question        Question `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
	QuestionPaperID uint     `gorm:"not null" json:"question_paper_id"`
	QuestionPaper   QuestionPaper `gorm:"foreignKey:QuestionPaperID" json:"question_paper,omitempty"`
	UsedBy          uint     `gorm:"not null" json:"used_by"`
	User            User     `gorm:"foreignKey:UsedBy" json:"user,omitempty"`
	UsedAt          time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"used_at"`
}

// API Response structures
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// Authentication Request/Response structures
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Email         string `json:"email" validate:"required,email"`
	Name          string `json:"name" validate:"required"`
	Password      string `json:"password" validate:"required,min=6"`
	InstitutionID *uint  `json:"institution_id"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    uint   `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"user"`
}

// Question Request structures
type CreateQuestionRequest struct {
	Content       string `json:"content" validate:"required"`
	Type          string `json:"type" validate:"required,oneof=mcq numerical descriptive true_false fill_blank"`
	Difficulty    string `json:"difficulty" validate:"required,oneof=easy medium hard"`
	Marks         int    `json:"marks" validate:"min=1"`
	SubjectID     uint   `json:"subject_id" validate:"required"`
	ChapterID     uint   `json:"chapter_id" validate:"required"`
	Options       string `json:"options,omitempty"`
	CorrectAnswer string `json:"correct_answer,omitempty"`
	Explanation   string `json:"explanation,omitempty"`
}

type UpdateQuestionRequest struct {
	Content       *string `json:"content,omitempty"`
	Type          *string `json:"type,omitempty" validate:"omitempty,oneof=mcq numerical descriptive true_false fill_blank"`
	Difficulty    *string `json:"difficulty,omitempty" validate:"omitempty,oneof=easy medium hard"`
	Marks         *int    `json:"marks,omitempty" validate:"omitempty,min=1"`
	SubjectID     *uint   `json:"subject_id,omitempty"`
	ChapterID     *uint   `json:"chapter_id,omitempty"`
	Options       *string `json:"options,omitempty"`
	CorrectAnswer *string `json:"correct_answer,omitempty"`
	Explanation   *string `json:"explanation,omitempty"`
}

// Question Paper Request structures
type CreateQuestionPaperRequest struct {
	Title        string     `json:"title" validate:"required"`
	Description  string     `json:"description"`
	ExamDate     *time.Time `json:"exam_date"`
	Duration     int        `json:"duration"`
	Instructions string     `json:"instructions"`
	SubjectID    uint       `json:"subject_id" validate:"required"`
}

type AddQuestionToPaperRequest struct {
	QuestionID uint `json:"question_id" validate:"required"`
	OrderIndex int  `json:"order_index" validate:"required"`
	Marks      int  `json:"marks" validate:"required,min=1"`
}
