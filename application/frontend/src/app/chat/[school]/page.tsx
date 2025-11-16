"use client";

import Image from "next/image";
import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Bot, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ALL_PARAMETERS } from "@/components/geolocator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "model";
  content: string;
};

function ChatContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const schoolName = decodeURIComponent(params.school as string);
  const similarity = searchParams.get("similarity");
  const imageUrl = searchParams.get("imageUrl");

  const queryParams = Array.from(searchParams.entries()).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  const displayedParams = Array.from(searchParams.entries())
    .map(([key, value]) => {
      const paramConfig = ALL_PARAMETERS.find((p) => p.id === key);
      const label = paramConfig ? paramConfig.label : key;

      if (
        key === "similarity" ||
        key === "place_id" ||
        key === "k" ||
        key === "imageUrl" ||
        value === "NaN" ||
        value === "null" ||
        value === "false" ||
        value === ""
      ) {
        return null;
      }

      if (key === "isUrgent" && value === "true") {
        return { label: "Urgent", value: null };
      }

      if (key === "notes") return null;

      return { label, value };
    })
    .filter(Boolean);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolName,
            similarity,
            searchParams: queryParams,
            history: [...messages, userMessage],
            message: input,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to get response from the chatbot."
        );
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "model", content: data.message },
      ]);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      // remove the optimistic user message if the call fails
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <Card className="w-full max-w-3xl flex flex-col h-[90vh]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">{schoolName}</CardTitle>
                {imageUrl && (
                  //   <Image
                  //     src={imageUrl}
                  //     alt={`Image of ${schoolName}`}
                  //     width={64}
                  //     height={64}
                  //     className="rounded-lg border ml-4"
                  //     data-ai-hint="school building"
                  //   />
                  <img src={imageUrl} className="w-30 h-20" alt="" />
                )}
              </div>
              <CardDescription>
                Ask questions about this school and your query.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Query Details</h3>
            <div className="flex flex-wrap gap-2">
              {similarity && (
                <Badge variant="secondary">
                  Similarity: {(Number(similarity) * 100).toFixed(2)}%
                </Badge>
              )}
              {displayedParams.map(
                (param, index) =>
                  param && (
                    <Badge key={index} variant="outline">
                      {param.label}
                      {param.value ? `: ${param.value}` : ""}
                    </Badge>
                  )
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "model" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg p-3 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-4 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-6 border-t">
          <div className="flex w-full items-center gap-2">
            <Textarea
              placeholder="Ask a follow-up question..."
              className="min-h-0 flex-1"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
