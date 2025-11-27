import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FormBuilder from "@/components/form-builder"

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user is a merchant and owns this form
  const { data: form } = await supabase
    .from("forms")
    .select("*, form_fields(*)")
    .eq("id", id)
    .eq("merchant_id", data.user.id)
    .single()

  if (!form) {
    redirect("/merchant/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Form</h1>
          <p className="text-muted-foreground mt-2">Update your form fields and settings</p>
        </div>
        <FormBuilder existingForm={form} />
      </div>
    </div>
  )
}
