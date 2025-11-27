import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We sent you a confirmation link. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Didn&apos;t receive the email? Check your spam folder.</p>
              <p className="text-xs bg-muted p-2 rounded">
                <strong>Development Note:</strong> Email confirmation is required by default in Supabase. To disable it
                for testing, go to your Supabase project Authentication settings and disable &quot;Enable email
                confirmations&quot; under Email Auth.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
