"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage as Message } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    SentIcon,
    BotIcon,
    UserIcon,
    Message01Icon,
    Settings02Icon,
} from "hugeicons-react";
import ReactMarkdown from "react-markdown";

interface ChatPanelProps {
    resumeContext?: string;
    jobContext?: string;
}

const STARTER_PROMPTS = [
    "How do I pass ATS screening?",
    "Tips for salary negotiation",
    "How to explain career gaps?",
    "Extract keywords from the job description",
];

export default function ChatPanel({ resumeContext, jobContext }: ChatPanelProps) {
    const { messages, status, sendMessage } = useChat();

    const [input, setInput] = useState("");
    const isLoading = status === "submitted" || status === "streaming";

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFormSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        sendMessage(
            { role: 'user', parts: [{ type: 'text', text: input.trim() }] },
            { body: { resumeContext, jobContext } }
        );
        setInput("");

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
                const event = new Event('submit', { bubbles: true, cancelable: true });
                e.currentTarget.form?.dispatchEvent(event);
            }
        }
    };

    const handleTextareaInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    return (
        <div className="chat-panel h-full flex flex-col relative w-full overflow-hidden p-2 lg:p-4">
            <div className="chat-panel-body flex-1 overflow-hidden h-full flex flex-col">
                {/* Messages area */}
                <div className="chat-messages flex-1 overflow-y-auto w-full px-2 lg:px-4 mb-2">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center justify-center h-full gap-3 px-2 pt-10"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] border border-[#111827]/20">
                                <Message01Icon className="h-6 w-6 text-white" strokeWidth={1.5} />
                            </div>
                            <p className="text-[13px] text-muted text-center font-medium">
                                Zofu AI Coach
                            </p>
                            <p className="text-[12px] text-muted-light text-center leading-relaxed max-w-[200px]">
                                Ask me anything about your resume, the target job, or interview prep.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                                {STARTER_PROMPTS.map((prompt, i) => (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.3 }}
                                        key={prompt}
                                        onClick={() => {
                                            setInput(prompt);
                                            setTimeout(() => {
                                                if (textareaRef.current?.form) {
                                                    const event = new Event('submit', { bubbles: true, cancelable: true });
                                                    textareaRef.current.form.dispatchEvent(event);
                                                }
                                            }, 50);
                                        }}
                                        className="starter-prompt text-left w-full truncate border border-border hover:border-black/20 hover:-translate-y-0.5"
                                    >
                                        {prompt}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-6 pt-4 pb-4">
                            <AnimatePresence>
                                {messages.map((msg: Message) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className={`chat-bubble w-full ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}
                                    >
                                        <div className="chat-bubble-icon shrink-0">
                                            {msg.role === "user" ? (
                                                <UserIcon className="h-3.5 w-3.5" strokeWidth={2} />
                                            ) : (
                                                <BotIcon className="h-3.5 w-3.5 md:w-3.5 md:h-3.5" strokeWidth={2} />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 max-w-[85%]">
                                            {/* Tool Invocation Feedback */}
                                            {msg.parts?.map((part: any, index: number) => {
                                                if (part.type.startsWith('tool-') || part.type === 'dynamic-tool') {
                                                    const toolName = part.toolName || part.type.replace('tool-', '');
                                                    const isFinished = part.state?.startsWith('output-');
                                                    return (
                                                        <div key={part.toolCallId || index} className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-surface-sunken border border-border/60 text-[11px] text-muted font-mono self-start mt-1 mb-1">
                                                            <Settings02Icon className="w-3 h-3 text-primary animate-spin-slow" />
                                                            {!isFinished ?
                                                                <span>Running {toolName}...</span> :
                                                                <span className="text-success">Finished {toolName}</span>
                                                            }
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}

                                            {/* Debug Logger */}
                                            {/* (Removed red box to avoid clutter; UI logic will render any text found) */}

                                            {/* Text Content */}
                                            <div className="chat-bubble-text">
                                                {msg.role === "user" ? (
                                                    // @ts-ignore
                                                    msg.content || (msg.parts && msg.parts.map((p: any) => typeof p === 'string' ? p : (p.text || '')).join('')) || JSON.stringify(msg.parts)
                                                ) : (() => {
                                                    // Robustly extract text from various possible AI SDK shapes
                                                    const rawText =
                                                        // @ts-ignore
                                                        (typeof msg.content === 'string' ? msg.content : '') ||
                                                        // @ts-ignore
                                                        (typeof msg.text === 'string' ? msg.text : '') ||
                                                        (msg.parts ? msg.parts.map((p: any) => {
                                                            if (typeof p === 'string') return p;
                                                            if (p.type === 'text') return p.text || '';
                                                            if (p.text) return p.text;
                                                            return '';
                                                        }).join('') : "");

                                                    return (
                                                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:mb-2 prose-pre:bg-surface-sunken prose-pre:border prose-pre:border-border prose-pre:p-3 prose-pre:rounded-lg prose-ul:ml-4 prose-ol:ml-4">
                                                            {rawText && rawText.trim().length > 0 ? (
                                                                <ReactMarkdown>{rawText}</ReactMarkdown>
                                                            ) : (
                                                                <div className="text-[10px] text-muted-light/50 break-words font-mono opacity-50">
                                                                    {isLoading ? "Generating..." : `Empty response: ${JSON.stringify(msg)}`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && messages[messages.length - 1]?.role === "user" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="chat-bubble chat-bubble-ai opacity-70"
                                    >
                                        <div className="chat-bubble-icon border-border/50">
                                            <BotIcon className="h-3 w-3" />
                                        </div>
                                        <div className="flex items-center gap-2 text-muted bg-surface-sunken px-4 py-2.5 rounded-2xl border border-border h-max min-h-[38px]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce"></span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </div>

                {/* Input area */}
                <div className="pt-2 shrink-0 w-full">
                    <form
                        onSubmit={handleFormSubmit}
                        className="relative flex items-end gap-2 p-2 bg-white/60 backdrop-blur-md border border-border/80 rounded-2xl focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 w-full"
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onInput={handleTextareaInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask the AI engineer..."
                            disabled={isLoading}
                            rows={1}
                            className="flex-1 max-h-[120px] min-h-[24px] bg-transparent border-none resize-none outline-none py-1.5 px-2 text-[14px] text-foreground placeholder:text-muted-light scrollbar-thin overflow-y-auto leading-relaxed"
                            style={{ overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="flex shrink-0 items-center justify-center p-2 mb-0.5 rounded-xl bg-[#111827] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition-all h-[36px] w-[36px] overflow-hidden"
                        >
                            <SentIcon className="h-4 w-4 ml-0.5" strokeWidth={2.5} />
                        </button>
                    </form>
                    <div className="flex w-full justify-between items-center px-2 mt-2">
                        <p className="text-[10px] text-muted-light">
                            Press <kbd className="font-mono text-[9px] px-1 bg-surface-sunken rounded border border-border">Enter</kbd> to send, <kbd className="font-mono text-[9px] px-1 bg-surface-sunken rounded border border-border">Shift + Enter</kbd> for new line.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
