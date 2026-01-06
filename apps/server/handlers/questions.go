package handlers

import (
	"net/http"
	"question-hive-server/database"
	"question-hive-server/models"
	"question-hive-server/utils"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type questionRow struct {
	QuestionID   int    `json:"question_id"`
	QuestionText string `json:"question_text"`
	ChapterID    *int   `json:"chapter_id,omitempty"`
	DifficultyID *int   `json:"difficulty_id,omitempty"`
}

// GetQuestions lists questions with pagination
func GetQuestions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit <= 0 {
		limit = 10
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	chapterID := c.Query("chapter_id")
	difficultyID := c.Query("difficulty_id")

	base := "SELECT question_id, question_text, chapter_id, difficulty_id FROM question"
	where := ""
	args := []interface{}{}
	if chapterID != "" {
		where = appendWhere(where, "chapter_id = ?")
		args = append(args, chapterID)
	}
	if difficultyID != "" {
		where = appendWhere(where, "difficulty_id = ?")
		args = append(args, difficultyID)
	}
	order := " ORDER BY question_id DESC"
	limitClause := " LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	var rows []questionRow
	if err := database.DB.Raw(base+where+order+limitClause, args...).Scan(&rows).Error; err != nil {
		utils.LogError("Fetching questions", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to retrieve questions"})
		return
	}

	// Count total
	var total int64
	countQuery := "SELECT COUNT(*) FROM question" + where
	if err := database.DB.Raw(countQuery, args[:len(args)-2]...).Scan(&total).Error; err != nil {
		utils.LogError("Counting questions", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to count questions"})
		return
	}
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	c.JSON(http.StatusOK, models.PaginatedResponse{
		Success:    true,
		Message:    "Questions retrieved successfully",
		Data:       rows,
		Pagination: models.Pagination{Page: page, Limit: limit, Total: total, TotalPages: totalPages},
	})
}

// GetQuestion retrieves a single question
func GetQuestion(c *gin.Context) {
	id := c.Param("id")
	var row questionRow
	if err := database.DB.Raw("SELECT question_id, question_text, chapter_id, difficulty_id FROM question WHERE question_id = ?", id).Scan(&row).Error; err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Error: "Question not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Question retrieved successfully", Data: row})
}

// CreateQuestion not implemented with current schema
// CreateQuestion inserts a new question row
func CreateQuestion(c *gin.Context) {
	var req models.CreateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: "Invalid request: " + err.Error()})
		return
	}
	if err := utils.ValidateStruct(req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: "Validation failed: " + err.Error()})
		return
	}
	userID, _ := c.Get("user_id")
	// Insert
	sql := `INSERT INTO question (question_text,type,difficulty,marks,subject_id,chapter_id,options,correct_answer,explanation,created_by,is_active,is_ai_generated,usage_count)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING question_id`
	var newID int
	if err := database.DB.Raw(sql,
		req.Content,
		req.Type,
		req.Difficulty,
		req.Marks,
		req.SubjectID,
		req.ChapterID,
		nullableText(req.Options),
		nullableText(req.CorrectAnswer),
		nullableText(req.Explanation),
		userID,
		true,
		false,
		0,
	).Scan(&newID).Error; err != nil {
		utils.LogError("Insert question", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to create question"})
		return
	}
	// Return inserted row
	var row questionRow
	if err := database.DB.Raw(`SELECT question_id, question_text, chapter_id, difficulty_id FROM question WHERE question_id = ?`, newID).Scan(&row).Error; err != nil {
		c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Question created", Data: gin.H{"question_id": newID}})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Question created", Data: row})
}

// UpdateQuestion updates mutable fields
func UpdateQuestion(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: "Invalid request: " + err.Error()})
		return
	}
	// Build dynamic SET clause
	sets := []string{}
	args := []interface{}{}
	if req.Content != nil {
		sets = append(sets, "question_text = ?")
		args = append(args, *req.Content)
	}
	if req.Type != nil {
		sets = append(sets, "type = ?")
		args = append(args, *req.Type)
	}
	if req.Difficulty != nil {
		sets = append(sets, "difficulty = ?")
		args = append(args, *req.Difficulty)
	}
	if req.Marks != nil {
		sets = append(sets, "marks = ?")
		args = append(args, *req.Marks)
	}
	if req.SubjectID != nil {
		sets = append(sets, "subject_id = ?")
		args = append(args, *req.SubjectID)
	}
	if req.ChapterID != nil {
		sets = append(sets, "chapter_id = ?")
		args = append(args, *req.ChapterID)
	}
	if req.Options != nil {
		sets = append(sets, "options = ?")
		args = append(args, *req.Options)
	}
	if req.CorrectAnswer != nil {
		sets = append(sets, "correct_answer = ?")
		args = append(args, *req.CorrectAnswer)
	}
	if req.Explanation != nil {
		sets = append(sets, "explanation = ?")
		args = append(args, *req.Explanation)
	}
	if len(sets) == 0 {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Error: "No fields to update"})
		return
	}
	sql := "UPDATE question SET " + strings.Join(sets, ", ") + " WHERE question_id = ?"
	args = append(args, id)
	if err := database.DB.Exec(sql, args...).Error; err != nil {
		utils.LogError("Update question", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to update question"})
		return
	}
	var row questionRow
	if err := database.DB.Raw("SELECT question_id, question_text, chapter_id, difficulty_id FROM question WHERE question_id = ?", id).Scan(&row).Error; err != nil {
		c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Question updated"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Question updated", Data: row})
}

// DeleteQuestion soft deletes by setting is_active=false
func DeleteQuestion(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Exec("UPDATE question SET is_active = false WHERE question_id = ?", id).Error; err != nil {
		utils.LogError("Soft delete question", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Error: "Failed to delete question"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Question deleted"})
}

// helper to build WHERE clause
func appendWhere(existing, clause string) string {
	if existing == "" {
		return " WHERE " + clause
	}
	return existing + " AND " + clause
}

func nullableText(v string) interface{} {
	if v == "" {
		return nil
	}
	return v
}
