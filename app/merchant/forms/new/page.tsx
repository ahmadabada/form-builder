import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FormBuilder from "@/components/form-builder"

export default async function NewFormPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user is a merchant
  const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single()

  if (userData?.role !== "merchant") {
    redirect("/client/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Form</h1>
          <p className="text-muted-foreground mt-2">
            Build your custom form by adding fields and configuring their properties
          </p>
        </div>
        <FormBuilder />
      </div>
    </div>
  )
}
