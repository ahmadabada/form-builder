"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { MoreVertical, Edit, Trash2, Eye, Share2, FileText } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

interface Form {
  id: string
  title: string
  description?: string
  is_published: boolean
  created_at: string
  submissions: { count: number }[]
}

interface FormsListProps {
  forms: Form[]
}

export default function FormsList({ forms: initialForms }: FormsListProps) {
  const router = useRouter()
  const [forms, setForms] = useState(initialForms)
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const togglePublish = async (formId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("forms").update({ is_published: !currentStatus }).eq("id", formId)

    if (!error) {
      setForms(forms.map((f) => (f.id === formId ? { ...f, is_published: !currentStatus } : f)))
    }
  }

  const deleteForm = async () => {
    if (!deleteFormId) return

    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("forms").delete().eq("id", deleteFormId)

    if (!error) {
      setForms(forms.filter((f) => f.id !== deleteFormId))
    }

    setIsDeleting(false)
    setDeleteFormId(null)
  }

  const copyFormLink = (formId: string) => {
    const url = `${window.location.origin}/submit/${formId}`
    navigator.clipboard.writeText(url)
    alert("Form link copied to clipboard!")
  }

  if (forms.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
          <p className="text-muted-foreground mb-6">Create your first form to start collecting submissions</p>
          <Button asChild>
            <Link href="/merchant/forms/new">Create Form</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{form.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {form.description || "No description"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/merchant/forms/${form.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Form
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyFormLink(form.id)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/submit/${form.id}`} target="_blank">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteFormId(form.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published</span>
                <Switch checked={form.is_published} onCheckedChange={() => togglePublish(form.id, form.is_published)} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Badge variant={form.is_published ? "default" : "secondary"}>
                    {form.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/merchant/forms/${form.id}/submissions`}>
                    {form.submissions[0]?.count || 0} Submissions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteFormId} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this form? This will also delete all submissions. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteForm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
