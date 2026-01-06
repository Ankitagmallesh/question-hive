package handlers

import (
	"net/http"
	"question-hive-server/database"
	"question-hive-server/models"
	"question-hive-server/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Lightweight DTOs that match Drizzle schema tables
type examRow struct {
	ExamID      int     `json:"exam_id"`
	ExamName    string  `json:"exam_name"`
	Description *string `json:"description,omitempty"`
}

type subjectRow struct {
	SubjectID   int    `json:"subject_id"`
	SubjectName string `json:"subject_name"`
	ExamID      *int   `json:"exam_id,omitempty"`
}

type chapterRow struct {
	ChapterID   int    `json:"chapter_id"`
	ChapterName string `json:"chapter_name"`
	SubjectID   *int   `json:"subject_id,omitempty"`
}

// GetExams retrieves all exams from Drizzle schema (exam)
func GetExams(c *gin.Context) {
	var rows []examRow
	if err := database.DB.Raw(`SELECT exam_id, exam_name, description FROM exam ORDER BY exam_name ASC`).Scan(&rows).Error; err != nil {
		utils.LogError("Fetching exams", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to retrieve exams"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Exams retrieved successfully", Data: rows})
}

// GetSubjects retrieves subjects; supports optional exam_id from path or query
func GetSubjects(c *gin.Context) {
	examID := c.Param("exam_id")
	if examID == "" {
		examID = c.Query("exam_id")
	}
	var rows []subjectRow
	if examID != "" {
		if err := database.DB.Raw(`SELECT subject_id, subject_name, exam_id FROM subject WHERE exam_id = ? ORDER BY subject_name ASC`, examID).Scan(&rows).Error; err != nil {
			utils.LogError("Fetching subjects", err)
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to retrieve subjects"})
			return
		}
	} else {
		if err := database.DB.Raw(`SELECT subject_id, subject_name, exam_id FROM subject ORDER BY subject_name ASC`).Scan(&rows).Error; err != nil {
			utils.LogError("Fetching subjects", err)
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to retrieve subjects"})
			return
		}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Subjects retrieved successfully", Data: rows})
}

// GetSubject retrieves a specific subject by ID from Drizzle schema
func GetSubject(c *gin.Context) {
	subjectID := c.Param("subject_id")
	var row subjectRow
	if err := database.DB.Raw(`SELECT subject_id, subject_name, exam_id FROM subject WHERE subject_id = ?`, subjectID).Scan(&row).Error; err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Subject not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Subject retrieved successfully", Data: row})
}

// GetChapters retrieves chapters for a specific subject (or all if not provided)
func GetChapters(c *gin.Context) {
	subjectID := c.Param("subject_id")
	if subjectID == "" {
		subjectID = c.Query("subject_id")
	}
	var rows []chapterRow
	if subjectID != "" {
		if err := database.DB.Raw(`SELECT chapter_id, chapter_name, subject_id FROM chapter WHERE subject_id = ? ORDER BY chapter_name ASC`, subjectID).Scan(&rows).Error; err != nil {
			utils.LogError("Fetching chapters", err)
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to retrieve chapters"})
			return
		}
	} else {
		if err := database.DB.Raw(`SELECT chapter_id, chapter_name, subject_id FROM chapter ORDER BY chapter_name ASC`).Scan(&rows).Error; err != nil {
			utils.LogError("Fetching chapters", err)
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to retrieve chapters"})
			return
		}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Chapters retrieved successfully", Data: rows})
}

// GetChapter retrieves a specific chapter by ID
func GetChapter(c *gin.Context) {
	chapterIDStr := c.Param("chapter_id")
	if chapterIDStr == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: "Invalid chapter ID"})
		return
	}
	if _, err := strconv.Atoi(chapterIDStr); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: "Invalid chapter ID"})
		return
	}
	var row chapterRow
	if err := database.DB.Raw(`SELECT chapter_id, chapter_name, subject_id FROM chapter WHERE chapter_id = ?`, chapterIDStr).Scan(&row).Error; err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Chapter not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Chapter retrieved successfully", Data: row})
}

// GetInstitutions is not implemented with current Drizzle schema
func GetInstitutions(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.APIResponse{Success: false, Error: "Institutions are not managed by this service; handled via web/Drizzle"})
}
