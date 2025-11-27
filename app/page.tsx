import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">FormBuilder</h1>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">Build Custom Forms in Minutes</h2>
            <p className="text-lg md:text-xl text-muted-foreground text-balance">
              Create, publish, and manage forms effortlessly. Collect submissions from clients and grow your business.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">Login to Dashboard</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Easy Form Builder</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop interface to create forms with various field types
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Unlimited Forms</h3>
              <p className="text-sm text-muted-foreground">Create as many forms as you need for different purposes</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Track Submissions</h3>
              <p className="text-sm text-muted-foreground">View and manage all submissions from clients in one place</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 FormBuilder. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
