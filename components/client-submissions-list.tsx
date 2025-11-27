import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"

interface Submission {
  id: string
  submitted_at: string
  forms: {
    id: string
    title: string
    description?: string
  } | null
}

interface ClientSubmissionsListProps {
  submissions: Submission[]
}

export default function ClientSubmissionsList({ submissions }: ClientSubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
          <p className="text-muted-foreground">Your form submissions will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader>
            <CardTitle className="truncate">{submission.forms?.title || "Unknown Form"}</CardTitle>
            <CardDescription className="line-clamp-2">
              {submission.forms?.description || "No description"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(submission.submitted_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="mt-3">
              <Badge>Submitted</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
