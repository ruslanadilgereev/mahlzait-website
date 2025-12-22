import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ingredient {
    name: string;
    quantity: { value: number; unit: string };
    macros: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
}

interface MealCard {
    id: string;
    name: string;
    quantity: { value: number; unit: string };
    macros: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
    ingredients?: Ingredient[];
}

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    meals?: MealCard[];
}

const DEMO_SUGGESTIONS = [
    "1 Riegel ESN Pistachio",
    "200g Hähnchenbrust mit Reis",
    "https://www.chefkoch.de/rezepte/3134181466859477/Gebackene-Camembert-Happen.html",
];

const MAX_DEMO_MESSAGES = 3;

export default function LiveDemo() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [userMessageCount, setUserMessageCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        // Scroll only within the messages container, not the whole page
        if (messagesEndRef.current && messagesEndRef.current.parentElement) {
            const container = messagesEndRef.current.parentElement;
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Load session from localStorage on mount
        const saved = localStorage.getItem('demo_session_id');
        if (saved) {
            setSessionId(saved);
            console.log('Loaded session ID:', saved);
        }
    }, []);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading || userMessageCount >= MAX_DEMO_MESSAGES) return;

        const userMessage: Message = {
            role: "user",
            content: text,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setUserMessageCount((prev) => prev + 1);
        setInput("");
        setIsLoading(true);

        try {
            // Call public demo endpoint (no auth required)
            const response = await fetch("https://europe-west1-mytemple-460913.cloudfunctions.net/mahlzait-demo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_input: text,
                    session_id: sessionId || undefined
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();

            // Store session ID for context retention
            if (data.session_id && data.session_id !== sessionId) {
                setSessionId(data.session_id);
                localStorage.setItem('demo_session_id', data.session_id);
                console.log('New session ID:', data.session_id);
            }

            // Extract response text and meals
            const responseText = data.response || "Keine Antwort erhalten.";
            const meals = data.meals || [];

            const assistantMessage: Message = {
                role: "assistant",
                content: responseText,
                timestamp: Date.now(),
                meals: meals.length > 0 ? meals : undefined,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            
            // Show limit reached message after 3rd user message
            if (userMessageCount >= MAX_DEMO_MESSAGES) {
                setTimeout(() => {
                    const limitMessage: Message = {
                        role: "assistant",
                        content: "🎉 Du hast die Demo abgeschlossen! Lade die App herunter, um unbegrenzt weiterzumachen.",
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, limitMessage]);
                }, 1000);
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: error instanceof Error && error.message.includes('Rate limit')
                    ? "⏱️ Zu viele Anfragen. Bitte versuche es in einer Stunde erneut."
                    : "❌ Verbindung zum Backend fehlgeschlagen. Bitte versuche es später erneut.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <section id="live-demo" className="py-20 bg-gradient-to-b from-base-100 to-base-200">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Live <span className="text-primary">Demo</span>
                    </h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        Probiere den Agenten direkt hier aus! Tracke Mahlzeiten, frag nach Nährwerten - alles in Echtzeit.
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                    {/* Phone Mockup with Chat - Reusing Header Design */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative h-[580px] 2xs:h-[740px] sm:h-[680px] md:h-[600px] w-[280px] 2xs:w-[360px] sm:w-[320px] md:w-[290px] rounded-[3rem] mx-auto"
                    >
                        {/* Screen Content */}
                        <div className="absolute top-[12px] 2xs:top-[16px] sm:top-[14px] md:top-[13px] bottom-[20px] 2xs:bottom-[26px] sm:bottom-[23px] md:bottom-[21px] left-[12px] 2xs:left-[16px] sm:left-[14px] md:left-[13px] right-[12px] 2xs:right-[16px] sm:right-[14px] md:right-[13px] rounded-[1.6rem] 2xs:rounded-[2rem] sm:rounded-[1.8rem] md:rounded-[1.7rem] overflow-hidden shadow-inner">
                            <div className="flex flex-col h-full bg-base-100">
                                {/* Status Bar */}
                                <div className="bg-primary/10 px-3 2xs:px-4 py-2 2xs:py-2.5 flex justify-between items-center flex-shrink-0">
                                    <span className="font-semibold text-[11px] 2xs:text-xs">Mahlzait</span>
                                    <span className="opacity-70 text-[10px] 2xs:text-[11px]">🔴 Live</span>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 2xs:p-3 space-y-2 2xs:space-y-3 relative">
                                    {/* Background Logo Watermark */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.04] select-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 -960 960 960" width="80px" fill="currentColor" className="text-base-content">
                                            <path d="M280-80v-366q-51-14-85.5-56T160-600v-280h80v280h40v-280h80v280h40v-280h80v280q0 56-34.5 98T360-446v366h-80Zm400 0v-320H560v-280q0-83 58.5-141.5T760-880v800h-80Z"/>
                                        </svg>
                                        <div className="text-base-content font-bold text-2xl mt-2">Mahlzait</div>
                                    </div>
                                    <AnimatePresence>
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] px-2.5 2xs:px-3 py-1.5 2xs:py-2 rounded-2xl overflow-hidden ${msg.role === "user"
                                                        ? "bg-primary text-primary-content"
                                                        : "bg-base-200 text-base-content"
                                                        }`}
                                                >
                                                    <p className="text-[11px] 2xs:text-xs leading-relaxed break-words">{msg.content}</p>
                                                    
                                                    {/* Meal Cards */}
                                                    {msg.meals && msg.meals.length > 0 && (
                                                        <div className="mt-1.5 2xs:mt-2 space-y-1.5 2xs:space-y-2">
                                                            {msg.meals.map((meal) => (
                                                                <div key={meal.id} className="bg-base-300 rounded-lg p-1.5 2xs:p-2 border border-success/20">
                                                                    <div className="font-semibold flex items-center gap-1 text-[10px] 2xs:text-[11px]">
                                                                        <span className="text-[11px] 2xs:text-xs">🍽️</span>
                                                                        <span className="truncate">{meal.name}</span>
                                                                    </div>
                                                                    <div className="text-base-content/70 mt-0.5 text-[9px] 2xs:text-[10px]">
                                                                        {meal.quantity.value}{meal.quantity.unit} · {Math.round(meal.macros.kcal)} kcal
                                                                    </div>
                                                                    <div className="flex gap-1.5 2xs:gap-2 mt-0.5 text-base-content/60 text-[9px] 2xs:text-[10px]">
                                                                        <span>P: {meal.macros.protein_g.toFixed(1)}g</span>
                                                                        <span>C: {meal.macros.carbs_g.toFixed(1)}g</span>
                                                                        <span>F: {meal.macros.fat_g.toFixed(1)}g</span>
                                                                    </div>
                                                                    
                                                                    {/* Ingredients */}
                                                                    {meal.ingredients && meal.ingredients.length > 0 && (
                                                                        <div className="mt-1 pt-1 border-t border-base-content/10">
                                                                            <div className="text-base-content/60 mb-0.5 text-[8px] 2xs:text-[9px]">Zutaten:</div>
                                                                            {meal.ingredients.map((ing, ingIdx) => (
                                                                                <div key={ingIdx} className="text-base-content/70 ml-1.5 2xs:ml-2 text-[8px] 2xs:text-[9px] truncate">
                                                                                    • {ing.name} ({ing.quantity.value}{ing.quantity.unit})
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-base-200 px-2.5 2xs:px-3 py-1.5 2xs:py-2 rounded-2xl">
                                                <div className="flex space-x-1">
                                                    <div className="w-1 2xs:w-1.5 h-1 2xs:h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <div className="w-1 2xs:w-1.5 h-1 2xs:h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <div className="w-1 2xs:w-1.5 h-1 2xs:h-1.5 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                {userMessageCount >= MAX_DEMO_MESSAGES ? (
                                    <div className="p-2.5 2xs:p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-t border-primary/20 flex-shrink-0">
                                        <div className="text-center space-y-1 2xs:space-y-1.5">
                                            <p className="text-[11px] 2xs:text-xs font-semibold text-primary">
                                                🎉 Demo abgeschlossen!
                                            </p>
                                            <p className="text-[9px] 2xs:text-[10px] text-base-content/70">
                                                Für unbegrenztes Tracking
                                            </p>
                                            <a
                                                href="/app"
                                                className="btn btn-xs btn-primary text-[10px] 2xs:text-[11px]"
                                            >
                                                📱 App laden
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="p-1.5 2xs:p-2 bg-base-200 flex-shrink-0">
                                        <div className="flex gap-1 2xs:gap-1.5">
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                placeholder="Nachricht..."
                                                className="flex-1 input input-xs input-bordered bg-base-100 text-[11px] 2xs:text-xs min-w-0 h-7 2xs:h-8"
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!input.trim() || isLoading}
                                                className="btn btn-xs btn-primary min-w-[24px] 2xs:min-w-[28px] px-1 2xs:px-1.5 flex-shrink-0 h-7 2xs:h-8 text-sm"
                                            >
                                                →
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                        
                        {/* iPhone Frame Image - Same as Header */}
                        <img
                            src="/misc/iphone-frame.webp"
                            alt="Mahlzait Live Demo auf iPhone - Interaktive Kalorienzähler Demo"
                            className="relative z-10 h-full pointer-events-none"
                            style={{ aspectRatio: '432/885' }}
                        />
                    </motion.div>

                    {/* Info & Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Probier's aus! 🚀</h3>
                            <p className="text-base-content/70 mb-6">
                                Der Agent nutzt echte AI und verbindet sich mit deinem Backend. Stelle Fragen oder tracke Mahlzeiten.
                            </p>
                        </div>

                        {/* Quick Suggestions */}
                        {userMessageCount < MAX_DEMO_MESSAGES && (
                            <div>
                                <p className="text-sm font-semibold mb-3 text-base-content/80">Beispiele zum Testen:</p>
                                <div className="space-y-2">
                                    {DEMO_SUGGESTIONS.map((suggestion, idx) => {
                                        const isLink = suggestion.startsWith('http');
                                        const displayText = isLink ? '🔗 Gebackene Camembert-Happen (Link)' : `💬 ${suggestion}`;
                                        
                                        return (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => sendMessage(suggestion)}
                                                disabled={isLoading}
                                                className="w-full text-left px-4 py-3 bg-base-200 hover:bg-base-300 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {displayText}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* Download CTA - Always visible */}
                        {userMessageCount >= MAX_DEMO_MESSAGES && (
                            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30">
                                <div className="text-center space-y-3">
                                    <div className="text-4xl">🚀</div>
                                    <h3 className="text-lg font-bold">Bereit für mehr?</h3>
                                    <p className="text-sm text-base-content/70">
                                        Lade die App herunter und tracke unbegrenzt Mahlzeiten mit KI!
                                    </p>
                                    <a
                                        href="/app"
                                        className="btn btn-primary btn-block"
                                    >
                                        App jetzt herunterladen
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Features Highlight */}
                        {userMessageCount < MAX_DEMO_MESSAGES && (
                            <div className="bg-primary/10 rounded-xl p-4 space-y-2">
                                <p className="text-sm font-semibold flex items-center gap-2">
                                    <span className="text-primary">✨</span> Live Demo Features:
                                </p>
                                <ul className="text-sm space-y-1 text-base-content/70">
                                    <li>• Echte AI-Antworten</li>
                                    <li>• Nährwert-Tracking</li>
                                    <li>• Rezept-Analyse</li>
                                    <li>• Kontext-Erinnerung</li>
                                </ul>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
