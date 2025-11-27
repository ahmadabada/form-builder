import { createClient } from "@/lib/supabase/server"
import FormSubmission from "@/components/form-submission"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default async function SubmitFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the form with its fields
  const { data: form } = await supabase
    .from("forms")
    .select(`
      *,
      form_fields(*)
    `)
    .eq("id", id)
    .single()

  // Check if form exists and is published
  if (!form) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
                <p className="text-muted-foreground">This form does not exist or has been removed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form.is_published) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Form Not Available</h2>
                <p className="text-muted-foreground">This form is not currently accepting submissions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sort fields by order_index
  const sortedFields = form.form_fields.sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="min-h-svh bg-muted/30">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <FormSubmission form={{ ...form, form_fields: sortedFields }} />
        </div>
      </div>
    </div>
  )
}
