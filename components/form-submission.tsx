"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import type { Form, FormField } from "@/lib/types"
import { CheckCircle2, Send } from "lucide-react"

interface FormSubmissionProps {
  form: Form & { form_fields: FormField[] }
}

export default function FormSubmission({ form }: FormSubmissionProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [checkboxData, setCheckboxData] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData({ ...formData, [fieldId]: value })
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: "" })
    }
  }

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const current = checkboxData[fieldId] || []
    if (checked) {
      setCheckboxData({ ...checkboxData, [fieldId]: [...current, option] })
    } else {
      setCheckboxData({ ...checkboxData, [fieldId]: current.filter((o) => o !== option) })
    }
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: "" })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    form.form_fields.forEach((field) => {
      if (field.required) {
        if (field.field_type === "checkbox") {
          const values = checkboxData[field.id] || []
          if (values.length === 0) {
            newErrors[field.id] = `${field.label} is required`
          }
        } else {
          const value = formData[field.id]
          if (!value || value.trim() === "") {
            newErrors[field.id] = `${field.label} is required`
          }
        }
      }

      // Email validation
      if (field.field_type === "email" && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = "Please enter a valid email address"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Get current user (if logged in)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .insert({
          form_id: form.id,
          client_id: user?.id || null,
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Create answers
      const answers = form.form_fields.map((field) => {
        let value = ""
        if (field.field_type === "checkbox") {
          value = (checkboxData[field.id] || []).join(", ")
        } else {
          value = formData[field.id] || ""
        }

        return {
          submission_id: submission.id,
          field_id: field.id,
          value,
        }
      })

      const { error: answersError } = await supabase.from("submission_answers").insert(answers)

      if (answersError) throw answersError

      setIsSuccess(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
              <p className="text-muted-foreground mb-6">Your form has been submitted successfully.</p>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{form.title}</CardTitle>
        {form.description && <CardDescription className="text-base">{form.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.form_fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.field_type === "text" && (
                <Input
                  id={field.id}
                  type="text"
                  placeholder={field.placeholder || ""}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={errors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.field_type === "email" && (
                <Input
                  id={field.id}
                  type="email"
                  placeholder={field.placeholder || ""}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={errors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.field_type === "number" && (
                <Input
                  id={field.id}
                  type="number"
                  placeholder={field.placeholder || ""}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={errors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.field_type === "date" && (
                <Input
                  id={field.id}
                  type="date"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={errors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.field_type === "textarea" && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder || ""}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  rows={4}
                  className={errors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.field_type === "select" && (
                <Select value={formData[field.id] || ""} onValueChange={(value) => handleInputChange(field.id, value)}>
                  <SelectTrigger className={errors[field.id] ? "border-destructive" : ""}>
                    <SelectValue placeholder={field.placeholder || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {((field.options as string[]) || []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.field_type === "radio" && (
                <RadioGroup
                  value={formData[field.id] || ""}
                  onValueChange={(value) => handleInputChange(field.id, value)}
                  className={errors[field.id] ? "border border-destructive rounded-md p-3" : ""}
                >
                  {((field.options as string[]) || []).map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                      <Label htmlFor={`${field.id}-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {field.field_type === "checkbox" && (
                <div className={`space-y-2 ${errors[field.id] ? "border border-destructive rounded-md p-3" : ""}`}>
                  {((field.options as string[]) || []).map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.id}-${option}`}
                        checked={(checkboxData[field.id] || []).includes(option)}
                        onCheckedChange={(checked) => handleCheckboxChange(field.id, option, checked as boolean)}
                      />
                      <Label htmlFor={`${field.id}-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {errors[field.id] && <p className="text-sm text-destructive">{errors[field.id]}</p>}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
