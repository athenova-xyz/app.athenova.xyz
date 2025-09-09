import Link from "next/link"
import { Button } from "@/components/ui/button"
import documents from "../../../data/documents.json"

export default function EditorDashboard() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Editor Dashboard</h1>
        <Button asChild variant="default">
          <Link href="/editor/new">New Course</Link>
        </Button>
      </div>
      <div className="rounded-lg border bg-background p-4">
        <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
        <ul className="space-y-2">
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted transition">
              <div>
                <span className="font-medium text-base">{doc.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">{doc.status}</span>
              </div>
              <span className="text-xs text-muted-foreground">{doc.updatedAt}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
