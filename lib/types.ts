export type UserRole = "merchant" | "client"

export interface User {
  id: string
  email: string
  role: UserRole
  full_name?: string
  created_at: string
}

export interface Form {
  id: string
  merchant_id: string
  title: string
  description?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export type FieldType = "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date"

export interface FormField {
  id: string
  form_id: string
  field_type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // for select, radio, checkbox
  order_index: number
  created_at: string
}

export interface Submission {
  id: string
  form_id: string
  client_id?: string
  submitted_at: string
}

export interface SubmissionAnswer {
  id: string
  submission_id: string
  field_id: string
  value: string
  created_at: string
}
