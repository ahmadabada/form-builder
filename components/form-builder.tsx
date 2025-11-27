"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { FieldType, Form, FormField } from "@/lib/types"
import { Plus, Trash2, GripVertical, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface FormBuilderProps {
  existingForm?: Form & { form_fields: FormField[] }
}

interface FormFieldConfig {
  id: string
  field_type: FieldType
  label: string
  placeholder: string
  required: boolean
  options: string[]
  order_index: number
}

export default function FormBuilder({ existingForm }: FormBuilderProps) {
  const router = useRouter()
  const [title, setTitle] = useState(existingForm?.title || "")
  const [description, setDescription] = useState(existingForm?.description || "")
  const [fields, setFields] = useState<FormFieldConfig[]>(
    existingForm?.form_fields.map((f) => ({
      id: f.id,
      field_type: f.field_type,
      label: f.label,
      placeholder: f.placeholder || "",
      required: f.required,
      options: (f.options as string[]) || [],
      order_index: f.order_index,
    })) || [],
  )
  const [isSaving, setIsSaving] = useState(false)

  const addField = () => {
    const newField: FormFieldConfig = {
      id: `temp-${Date.now()}`,
      field_type: "text",
      label: "",
      placeholder: "",
      required: false,
      options: [],
      order_index: fields.length,
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<FormFieldConfig>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const moveField = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === fields.length - 1)) {
      return
    }

    const newFields = [...fields]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]

    // Update order_index
    newFields.forEach((field, i) => {
      field.order_index = i
    })

    setFields(newFields)
  }

  const saveForm = async () => {
    if (!title.trim()) {
      alert("Please enter a form title")
      return
    }

    if (fields.length === 0) {
      alert("Please add at least one field")
      return
    }

    // Check if all fields have labels
    if (fields.some((f) => !f.label.trim())) {
      alert("Please provide labels for all fields")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (existingForm) {
        // Update existing form
        const { error: formError } = await supabase
          .from("forms")
          .update({
            title,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingForm.id)

        if (formError) throw formError

        // Delete old fields
        const { error: deleteError } = await supabase.from("form_fields").delete().eq("form_id", existingForm.id)

        if (deleteError) throw deleteError

        // Insert new fields
        const fieldsToInsert = fields.map((field, index) => ({
          form_id: existingForm.id,
          field_type: field.field_type,
          label: field.label,
          placeholder: field.placeholder || null,
          required: field.required,
          options: field.options.length > 0 ? field.options : null,
          order_index: index,
        }))

        const { error: fieldsError } = await supabase.from("form_fields").insert(fieldsToInsert)

        if (fieldsError) throw fieldsError

        router.push("/merchant/dashboard")
      } else {
        // Create new form
        const { data: newForm, error: formError } = await supabase
          .from("forms")
          .insert({
            merchant_id: user.id,
            title,
            description,
          })
          .select()
          .single()

        if (formError) throw formError

        // Insert fields
        const fieldsToInsert = fields.map((field, index) => ({
          form_id: newForm.id,
          field_type: field.field_type,
          label: field.label,
          placeholder: field.placeholder || null,
          required: field.required,
          options: field.options.length > 0 ? field.options : null,
          order_index: index,
        }))

        const { error: fieldsError } = await supabase.from("form_fields").insert(fieldsToInsert)

        if (fieldsError) throw fieldsError

        router.push("/merchant/dashboard")
      }
    } catch (error) {
      console.error("Error saving form:", error)
      alert("Failed to save form. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Contact Form, Survey, Registration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for your form"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Form Fields</h2>
          <Button onClick={addField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No fields added yet. Click &quot;Add Field&quot; to get started.
            </CardContent>
          </Card>
        )}

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Field Type *</Label>
                        <Select
                          value={field.field_type}
                          onValueChange={(value) => updateField(index, { field_type: value as FieldType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="radio">Radio Buttons</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Label *</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder="e.g., Full Name, Email Address"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        placeholder="Optional placeholder text"
                      />
                    </div>

                    {(field.field_type === "select" ||
                      field.field_type === "radio" ||
                      field.field_type === "checkbox") && (
                      <div className="space-y-2">
                        <Label>Options (one per line) *</Label>
                        <Textarea
                          value={field.options.join("\n")}
                          onChange={(e) =>
                            updateField(index, {
                              options: e.target.value.split("\n").filter((o) => o.trim()),
                            })
                          }
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={4}
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(index, { required: checked })}
                      />
                      <Label htmlFor={`required-${field.id}`} className="font-normal cursor-pointer">
                        Required field
                      </Label>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => router.push("/merchant/dashboard")} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={saveForm} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : existingForm ? "Update Form" : "Create Form"}
        </Button>
      </div>
    </div>
  )
}
