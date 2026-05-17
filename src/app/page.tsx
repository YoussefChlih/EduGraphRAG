import Link from "next/link";
import { Upload, MessageSquare, Network, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Upload,
    title: "Upload Documents",
    description: "Upload PDFs, lecture notes, and exercises in English, French, or Arabic.",
    href: "/upload",
  },
  {
    icon: MessageSquare,
    title: "Ask Questions",
    description: "Chat with your course materials and get cited, contextual answers.",
    href: "/chat",
  },
  {
    icon: Network,
    title: "Explore Concepts",
    description: "Visualize how concepts relate to each other in a knowledge graph.",
    href: "/graph",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <BookOpen className="h-10 w-10 text-zinc-900 dark:text-zinc-50" />
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Kwiz_y
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          AI-powered educational assistant that transforms your course documents
          into an intelligent knowledge graph. Ask questions, explore concepts,
          and learn smarter.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/upload">
            <Button size="lg">
              <Upload className="h-4 w-4" />
              Upload a Document
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" size="lg">
              <MessageSquare className="h-4 w-4" />
              Start Chatting
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <Icon className="h-8 w-8 text-zinc-700 dark:text-zinc-300 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Supported Languages */}
      <div className="mt-16 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Multilingual Support
        </h2>
        <div className="mt-4 flex items-center justify-center gap-6 text-2xl">
          <span title="English">🇬🇧 English</span>
          <span title="French">🇫🇷 Français</span>
          <span title="Arabic">🇸🇦 العربية</span>
        </div>
      </div>
    </div>
  );
}
