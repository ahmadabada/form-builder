import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SubmissionsList from "@/components/submissions-list"

export default async function FormSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user is a merchant and owns this form
  const { data: form } = await supabase.from("forms").select("*").eq("id", id).eq("merchant_id", data.user.id).single()

  if (!form) {
    redirect("/merchant/dashboard")
  }

  // Fetch submissions with answers
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      users:client_id(full_name, email),
      submission_answers(
        *,
        form_fields(*)
      )
    `)
    .eq("form_id", id)
    .order("submitted_at", { ascending: false })

  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/merchant/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{form.title}</h1>
              <p className="text-sm text-muted-foreground">Form Submissions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Submissions</h2>
          <p className="text-muted-foreground">View all responses to this form</p>
        </div>

        <SubmissionsList submissions={submissions || []} />
      </main>
    </div>
  )
}
