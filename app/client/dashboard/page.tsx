import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import ClientSubmissionsList from "@/components/client-submissions-list"

export default async function ClientDashboard() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user is a client
  const { data: userData } = await supabase.from("users").select("role, full_name").eq("id", data.user.id).single()

  if (userData?.role !== "client") {
    redirect("/merchant/dashboard")
  }

  // Fetch client's submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      forms:form_id (
        id,
        title,
        description
      )
    `)
    .eq("client_id", data.user.id)
    .order("submitted_at", { ascending: false })

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Client Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {userData?.full_name || "Client"}</p>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Submissions</h2>
          <p className="text-muted-foreground">View all forms you have submitted</p>
        </div>

        <ClientSubmissionsList submissions={submissions || []} />
      </main>
    </div>
  )
}
