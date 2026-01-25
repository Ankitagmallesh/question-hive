"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "../components/ui/scroll-area"
import {
  Sparkles,
  Send,
  Paperclip,
  ImageIcon,
  FileText,
  Loader2,
  User,
  Bot,
  Upload,
  X,
  History,
  Plus,
  Trash2,
  MessageSquare,
} from "lucide-react"
import { useToast } from "../hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  attachments?: Array<{
    type: "image" | "file"
    name: string
    url: string
    size?: number
  }>
  timestamp: Date
  questions?: Question[]
}

interface Question {
  id: string
  text: string
  type: "mcq" | "short" | "long" | "fill"
  options?: string[]
  marks: number
  difficulty: "easy" | "medium" | "hard"
}

interface Session {
  id: string
  name: string
  messages: Message[]
  createdAt: Date
  lastUpdated: Date
}

interface QuestionGeneratorProps {
  onQuestionsGenerated: (questions: Question[]) => void
  difficultyLevel: string
  subject: string
}

export function QuestionGenerator({ onQuestionsGenerated, difficultyLevel, subject }: QuestionGeneratorProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const savedSessions = localStorage.getItem("questionhive-sessions")
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: unknown) => ({
        ...(session as Record<string, unknown>),
        createdAt: new Date((session as { createdAt: string }).createdAt),
        lastUpdated: new Date((session as { lastUpdated: string }).lastUpdated),
        messages: (session as { messages: { timestamp: string; [key: string]: unknown }[] }).messages.map((msg: unknown) => ({
          ...(msg as Record<string, unknown>),
          timestamp: new Date((msg as { timestamp: string }).timestamp),
        })),
      }))
      setSessions(parsedSessions)

      if (parsedSessions.length > 0) {
        const mostRecent = parsedSessions.sort(
          (a: Session, b: Session) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
        )[0]
        setCurrentSessionId(mostRecent.id)
        setMessages(mostRecent.messages)
      }
    }
  }, [])

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("questionhive-sessions", JSON.stringify(sessions))
    }
  }, [sessions])

  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId ? { ...session, messages, lastUpdated: new Date() } : session,
        ),
      )
    }
  }, [messages, currentSessionId])

  const createNewSession = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    }

    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setMessages([])

    toast({
      title: "New Session Created",
      description: "Started a fresh conversation session.",
    })
  }

  const switchToSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)

      toast({
        title: "Session Loaded",
        description: `Switched to ${session.name}`,
      })
    }
  }

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setSessions((prev) => prev.filter((s) => s.id !== sessionId))

    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId)
      if (remainingSessions.length > 0) {
        const nextSession = remainingSessions[0]
        setCurrentSessionId(nextSession.id)
        setMessages(nextSession.messages)
      } else {
        setCurrentSessionId(null)
        setMessages([])
      }
    }

    toast({
      title: "Session Deleted",
      description: "Conversation session has been removed.",
    })
  }

  const getCurrentSessionName = () => {
    const session = sessions.find((s) => s.id === currentSessionId)
    return session?.name || "New Session"
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter((file) => {
      const isValidImage = ["image/png", "image/jpeg", "image/webp"].includes(file.type)
      const isValidSize = file.size <= 7 * 1024 * 1024 // 7MB limit

      if (!isValidImage && !file.type.includes("text") && !file.type.includes("pdf")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        return false
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 7MB limit.`,
          variant: "destructive",
        })
        return false
      }

      return true
    })

    setAttachments((prev) => [...prev, ...validFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!input.trim() && attachments.length === 0) return

    let sessionId = currentSessionId
    if (!sessionId) {
      const newSession: Session = {
        id: Date.now().toString(),
        name: `Session ${sessions.length + 1}`,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
      }
      setSessions((prev) => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
      sessionId = newSession.id
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      attachments: attachments.map((file) => ({
        type: file.type.startsWith("image/") ? "image" : "file",
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      })),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("message", input)
      formData.append("difficultyLevel", difficultyLevel)
      formData.append("subject", subject)

      attachments.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      const response = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to generate questions"
        const errorDetails = errorData.details || ""

        console.error("API Error:", errorMessage, errorDetails)

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        // Add assistant message with error information for better UX
        const errorAssistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ **Error**: ${errorMessage}\n\n${errorDetails}\n\n💡 **Tip**: If you're seeing an API key error, please make sure your Gemini API key is properly configured in your environment variables.`,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorAssistantMessage])
        return
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response generated",
        timestamp: new Date(),
        questions: parseQuestionsFromResponse(data.response || ""),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (assistantMessage.questions && assistantMessage.questions.length > 0) {
        onQuestionsGenerated(assistantMessage.questions)
      }

      toast({
        title: "Questions Generated",
        description: "AI has successfully generated your questions!",
      })
    } catch (error) {
      console.error("Error generating questions:", error)

      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: '❌ **Connection Error**: Unable to reach the QuestionHive AI service.\n\n💡 **Please try again in a moment.** If the problem persists, check your internet connection.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorAssistantMessage])

      toast({
        title: "Connection Error",
        description: "Unable to connect to QuestionHive AI. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setAttachments([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const parseQuestionsFromResponse = (response: string): Question[] => {
    const questions: Question[] = []
    const lines = response.split("\n")
    let currentQuestion: Partial<Question> = {}
    let questionCounter = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.match(/^(\d+\.|Q\d+|Question \d+|Q\d+\.)/i)) {
        if (currentQuestion.text) {
          questions.push({
            id: `q-${Date.now()}-${questionCounter++}`,
            text: currentQuestion.text,
            type: currentQuestion.type || "short",
            options: currentQuestion.options,
            marks: currentQuestion.marks || 5,
            difficulty: (difficultyLevel.toLowerCase() as "easy" | "medium" | "hard") || "medium",
          })
        }

        currentQuestion = {
          text: line.replace(/^(\d+\.|Q\d+\.?|Question \d+\.?|Q\d+\.)/i, "").trim(),
          type: "short",
          marks: 5,
        }

        if (line.toLowerCase().includes("mcq") || line.toLowerCase().includes("multiple choice")) {
          currentQuestion.type = "mcq"
        } else if (line.toLowerCase().includes("essay") || line.toLowerCase().includes("long")) {
          currentQuestion.type = "long"
          currentQuestion.marks = 10
        }
      } else if (currentQuestion.text && line.match(/^[a-d]\)|^[A-D]\)/)) {
        if (!currentQuestion.options) currentQuestion.options = []
        currentQuestion.options.push(line.replace(/^[a-dA-D]\)\s*/, ""))
        currentQuestion.type = "mcq"
      } else if (currentQuestion.text && line && !line.match(/^(Answer|Solution|Explanation):/i)) {
        currentQuestion.text += " " + line
      }
    }

    if (currentQuestion.text) {
      questions.push({
        id: `q-${Date.now()}-${questionCounter++}`,
        text: currentQuestion.text,
        type: currentQuestion.type || "short",
        options: currentQuestion.options,
        marks: currentQuestion.marks || 5,
        difficulty: (difficultyLevel.toLowerCase() as "easy" | "medium" | "hard") || "medium",
      })
    }

    return questions
  }

  const handleDragStart = (e: React.DragEvent, question: Question) => {
    e.dataTransfer.setData("application/json", JSON.stringify(question))
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-4 border-b bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-700">{getCurrentSessionName()}</h3>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={createNewSession} size="sm" variant="outline" className="h-8 px-3 text-xs bg-transparent">
              <Plus className="w-3 h-3 mr-1" />
              New
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 px-3 text-xs bg-transparent">
                  <History className="w-3 h-3 mr-1" />
                  History ({sessions.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {sessions.length === 0 ? (
                  <DropdownMenuItem disabled>No conversation history</DropdownMenuItem>
                ) : (
                  sessions.map((session) => (
                    <DropdownMenuItem
                      key={session.id}
                      onClick={() => switchToSession(session.id)}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.name}</p>
                        <p className="text-xs text-slate-500">
                          {session.messages.length} messages • {session.lastUpdated.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={(e) => deleteSession(session.id, e)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 ml-2 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
                {sessions.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={createNewSession} className="text-blue-600 font-medium">
                      <Plus className="w-3 h-3 mr-2" />
                      Start New Session
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-3">QuestionHive AI</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Generate comprehensive question papers using AI. Upload images, documents, or simply describe what you
                need.
              </p>

              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Try these examples:</p>
                <div className="grid gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs py-2 px-3 border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => setInput("Generate 10 MCQs on photosynthesis for grade 10")}
                  >
                    Generate 10 MCQs on photosynthesis for grade 10
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs py-2 px-3 border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer transition-colors"
                    onClick={() => setInput("Create MCQs from the uploaded document")}
                  >
                    Create MCQs from the uploaded document
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs py-2 px-3 border-green-200 text-green-700 hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => setInput("Make MCQs about World War II causes and effects")}
                  >
                    Make MCQs about World War II causes and effects
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs py-2 px-3 border-orange-200 text-orange-700 hover:bg-orange-50 cursor-pointer transition-colors"
                    onClick={() => setInput("Generate MCQs from this assignment or question paper")}
                  >
                    Generate MCQs from this assignment or question paper
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  📝 MCQ Generation
                </Badge>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  📄 Document Analysis
                </Badge>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  🖼️ Image Processing
                </Badge>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                  📋 Assignment MCQs
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-4 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-green-500 to-emerald-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-4 shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      <div
                        className={`text-sm leading-relaxed ${message.role === "assistant" ? "prose prose-sm max-w-none" : ""}`}
                      >
                        {message.content.split("\n").map((line, index) => (
                          <p key={index} className={index > 0 ? "mt-2" : ""}>
                            {line || "\u00A0"}
                          </p>
                        ))}
                      </div>

                      {message.role === "assistant" && message.questions && message.questions.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-medium text-slate-600 mb-2">
                            💡 Drag questions to add them to your paper:
                          </p>
                          {message.questions.map((question) => (
                            <div
                              key={question.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, question)}
                              className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-medium text-slate-700 flex-1 line-clamp-2">
                                  {question.text}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-white/80">
                                    {question.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-white/80">
                                    {question.marks}m
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">🎯 Drag to question paper →</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                                message.role === "user" ? "bg-white/20" : "bg-slate-50"
                              }`}
                            >
                              {attachment.type === "image" ? (
                                <ImageIcon className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              <span className="font-medium">{attachment.name}</span>
                              {attachment.size && (
                                <span className="opacity-70">({(attachment.size / 1024).toFixed(1)}KB)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={`text-xs mt-2 ${message.role === "user" ? "text-white/70" : "text-slate-400"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm text-slate-600">QuestionHive is generating questions...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="p-6 border-t bg-white/50">
          {attachments.length > 0 && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Attached Files</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200 shadow-sm"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-xs font-medium text-slate-700">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="w-4 h-4 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Upload documents/assignments and ask: 'Create MCQs from this content' or describe what you need..."
                className="min-h-[52px] max-h-32 resize-none pr-12 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 backdrop-blur-sm"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute right-2 top-2 w-8 h-8 p-0 hover:bg-slate-100"
              >
                <Paperclip className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,.txt,.pdf,.doc,.docx,.rtf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  )
}
