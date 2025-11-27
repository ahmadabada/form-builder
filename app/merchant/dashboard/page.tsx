import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"
import FormsList from "@/components/forms-list"

export default async function MerchantDashboard() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user is a merchant
  const { data: userData } = await supabase.from("users").select("role, full_name").eq("id", data.user.id).single()

  if (userData?.role !== "merchant") {
    redirect("/client/dashboard")
  }

  // Fetch merchant's forms with submission counts
  const { data: forms } = await supabase
    .from("forms")
    .select(`
      *,
      submissions:submissions(count)
    `)
    .eq("merchant_id", data.user.id)
    .order("created_at", { ascending: false })

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
            <h1 className="text-xl font-semibold">Merchant Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {userData?.full_name || "Merchant"}</p>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Forms</h2>
            <p className="text-muted-foreground">Create and manage your custom forms</p>
          </div>
          <Button asChild>
            <Link href="/merchant/forms/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Link>
          </Button>
        </div>

        <FormsList forms={forms || []} />
      </main>
    </div>
  )
}
