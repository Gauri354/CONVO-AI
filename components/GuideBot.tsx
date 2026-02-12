"use client";

import { useChat } from "ai/react";
import { Bot, X, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const GuideBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
    });
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {/* Floating Action Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-[0_0_20px_-5px_var(--color-primary-200)] z-50 transition-all duration-300 hover:scale-110",
                    isOpen
                        ? "bg-destructive-100 hover:bg-destructive-200 text-white rotate-90"
                        : "bg-primary-200 hover:bg-primary-100 text-dark-100"
                )}
            >
                {isOpen ? (
                    <X className="h-8 w-8 transition-transform duration-300" />
                ) : (
                    <Bot className="h-14 w-14" />
                )}
            </Button>

            {/* Chat Window */}
            <div
                className={cn(
                    "fixed bottom-24 right-6 w-[350px] sm:w-[400px] bg-dark-100 border border-dark-300 rounded-xl shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="bg-dark-200 p-4 border-b border-dark-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-500/20 p-2 rounded-lg">
                            <Bot className="h-5 w-5 text-primary-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-light-100">Convo AI Guide</h3>
                            <p className="text-xs text-light-500">Always here to help</p>
                        </div>
                    </div>
                </div>

                {/* Messages Information Area (when empty) */}
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50 min-h-[300px]">
                        <Bot className="h-12 w-12 text-light-500" />
                        <p className="text-sm text-light-400">
                            Hi! I'm your Guide Bot. Ask me anything about SmartInterview or interview prep.
                        </p>
                    </div>
                )}

                {/* Chat Area */}
                {messages.length > 0 && (
                    <div className="flex-1 p-4 h-[400px] overflow-y-auto custom-scrollbar" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "flex w-full",
                                        m.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                            m.role === "user"
                                                ? "bg-primary-500 text-white rounded-br-none"
                                                : "bg-dark-200 text-light-200 rounded-bl-none border border-dark-300"
                                        )}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-dark-200 border border-dark-300 rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-light-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-light-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-light-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 bg-dark-200 border-t border-dark-300">
                    <div className="relative">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask for help..."
                            className="pr-10 bg-dark-100 border-dark-300 focus-visible:ring-primary-500"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1 top-1 h-8 w-8 hover:bg-primary-600"
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default GuideBot;
