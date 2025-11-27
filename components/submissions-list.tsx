"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Eye, FileText, Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface SubmissionAnswer {
  id: string
  value: string
  form_fields: {
    label: string
    field_type: string
  }
}

interface Submission {
  id: string
  submitted_at: string
  users: {
    full_name?: string
    email: string
  } | null
  submission_answers: SubmissionAnswer[]
}

interface SubmissionsListProps {
  submissions: Submission[]
}

export default function SubmissionsList({ submissions }: SubmissionsListProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  const exportToCSV = () => {
    if (submissions.length === 0) return

    // Get all unique field labels
    const fieldLabels = new Set<string>()
    submissions.forEach((sub) => {
      sub.submission_answers.forEach((answer) => {
        fieldLabels.add(answer.form_fields.label)
      })
    })

    // Create CSV header
    const headers = ["Submitted At", "Submitted By", ...Array.from(fieldLabels)]
    const csvRows = [headers.join(",")]

    // Create CSV rows
    submissions.forEach((submission) => {
      const row: string[] = [
        new Date(submission.submitted_at).toLocaleString(),
        submission.users?.full_name || submission.users?.email || "Anonymous",
      ]

      // Add answer values in order
      Array.from(fieldLabels).forEach((label) => {
        const answer = submission.submission_answers.find((a) => a.form_fields.label === label)
        row.push(`"${answer?.value || ""}"`)
      })

      csvRows.push(row.join(","))
    })

    // Download CSV
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `submissions-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
          <p className="text-muted-foreground">Submissions will appear here once clients start filling out your form</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Total submissions: {submissions.length}</p>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(submission.submitted_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {submission.users?.full_name || submission.users?.email || "Anonymous"}
                    </span>
                    {submission.users && !submission.users.full_name && (
                      <Badge variant="secondary" className="text-xs">
                        Guest
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(submission)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {submission.submission_answers.slice(0, 3).map((answer) => (
                  <div key={answer.id} className="text-sm">
                    <span className="font-medium text-muted-foreground">{answer.form_fields.label}:</span>{" "}
                    <span className="text-foreground">
                      {answer.value.length > 50 ? `${answer.value.substring(0, 50)}...` : answer.value}
                    </span>
                  </div>
                ))}
                {submission.submission_answers.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{submission.submission_answers.length - 3} more field
                    {submission.submission_answers.length - 3 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>Complete response data for this submission</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Submitted:</span>
                  <span>
                    {new Date(selectedSubmission.submitted_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Submitted by:</span>
                  <span>{selectedSubmission.users?.full_name || selectedSubmission.users?.email || "Anonymous"}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Responses</h4>
                {selectedSubmission.submission_answers.map((answer) => (
                  <div key={answer.id} className="space-y-1">
                    <Label className="text-sm font-medium">{answer.form_fields.label}</Label>
                    <div className="p-3 bg-muted/30 rounded-md text-sm">
                      {answer.value || <span className="text-muted-foreground italic">No response</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
