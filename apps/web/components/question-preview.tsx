"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, Printer, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  text: string
  type: "mcq" | "short" | "long" | "fill"
  options?: string[]
  marks: number
  difficulty: "easy" | "medium" | "hard"
}

interface QuestionPreviewProps {
  settings: {
    title: string
    subject: string
    duration: string
    totalMarks: string
    date: string
  }
  questions: Question[]
  layout: "horizontal" | "vertical"
  onQuestionsChange: (questions: Question[]) => void
}

export function QuestionPreview({ settings, questions, layout, onQuestionsChange }: QuestionPreviewProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    try {
      const questionData = e.dataTransfer.getData("application/json")
      const question: Question = JSON.parse(questionData)

      // Check if question already exists
      const exists = questions.some((q) => q.id === question.id)
      if (exists) {
        toast({
          title: "Question already added",
          description: "This question is already in your paper.",
          variant: "destructive",
        })
        return
      }

      // Add question to the paper
      const updatedQuestions = [...questions, question]
      onQuestionsChange(updatedQuestions)

      toast({
        title: "Question added!",
        description: "Question has been added to your paper.",
      })
    } catch (error) {
      console.error("Error adding question:", error)
      toast({
        title: "Error",
        description: "Failed to add question to paper.",
        variant: "destructive",
      })
    }
  }

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId)
    onQuestionsChange(updatedQuestions)
    toast({
      title: "Question removed",
      description: "Question has been removed from your paper.",
    })
  }

  if (questions.length === 0) {
    return (
      <Card className="h-full border-0 shadow-md bg-white/80">
        <CardContent
          className={`p-8 h-full flex flex-col items-center justify-center text-center transition-all duration-200 ${
            isDragOver ? "bg-blue-50 border-2 border-dashed border-blue-400" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-200 ${
              isDragOver
                ? "bg-gradient-to-br from-blue-100 to-blue-200 scale-110"
                : "bg-gradient-to-br from-slate-100 to-slate-200"
            }`}
          >
            {isDragOver ? (
              <Plus className="w-10 h-10 text-blue-600" />
            ) : (
              <FileText className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <h3 className="font-semibold text-slate-700 mb-2">A4 Question Paper</h3>
          <p
            className={`text-sm mb-3 leading-relaxed transition-colors duration-200 ${
              isDragOver ? "text-blue-600 font-medium" : "text-slate-500"
            }`}
          >
            {isDragOver
              ? "Drop questions here to add them to your paper!"
              : "Drag generated questions here or generate them with AI"}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>📏 210mm × 297mm (A4)</span>
            <span>📄 Professional Layout</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-0 shadow-md bg-white/80">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="p-4 border-b bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-slate-600">{questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
              <Printer className="w-3 h-3 mr-1" />
              Print
            </Button>
          </div>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-6 transition-all duration-200 ${isDragOver ? "bg-blue-50/50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-white text-black p-8 rounded-lg border-2 border-slate-200 shadow-sm min-h-full">
            {/* ... existing code for header ... */}

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border-b border-slate-200 pb-4 last:border-b-0 group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-800">Q{index + 1}.</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">
                        {question.difficulty}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">[{question.marks} marks]</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                  {/* ... existing code for question content ... */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
