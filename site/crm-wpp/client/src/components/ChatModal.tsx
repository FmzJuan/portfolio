import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Pause, Play } from "lucide-react";

interface ChatModalProps {
  contactId: number;
  onClose: () => void;
}

export default function ChatModal({ contactId, onClose }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [botPaused, setBotPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: contact } = trpc.contacts.getById.useQuery({ id: contactId });
  const { data: messages, refetch: refetchMessages } = trpc.messages.getByContact.useQuery({ contactId });
  const sendMessageMutation = trpc.messages.send.useMutation();
  const pauseBotMutation = trpc.bot.pause.useMutation();
  const resumeBotMutation = trpc.bot.resume.useMutation();
  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  useEffect(() => {
    markAsReadMutation.mutate({ contactId });
    const interval = setInterval(() => {
      refetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [contactId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        contactId,
        content: message,
      });
      setMessage("");
      refetchMessages();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handlePauseBot = async () => {
    try {
      await pauseBotMutation.mutateAsync({ contactId });
      setBotPaused(true);
    } catch (error) {
      console.error("Erro ao pausar bot:", error);
    }
  };

  const handleResumeBot = async () => {
    try {
      await resumeBotMutation.mutateAsync({ contactId });
      setBotPaused(false);
    } catch (error) {
      console.error("Erro ao retomar bot:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>{contact?.name}</DialogTitle>
              <p className="text-sm text-gray-500">{contact?.phone}</p>
            </div>
            <div className="flex gap-2">
              {botPaused ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResumeBot}
                  className="text-green-600"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Retomar Bot
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePauseBot}
                  className="text-red-600"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar Bot
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Histórico de Mensagens */}
          <ScrollArea className="flex-1 border rounded-lg p-4 mb-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages && messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-xs px-4 py-2 ${
                        msg.sender === "admin"
                          ? "bg-blue-500 text-white"
                          : msg.sender === "bot"
                          ? "bg-gray-200 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">
                          {msg.sender === "admin"
                            ? "Você"
                            : msg.sender === "bot"
                            ? "Bot"
                            : "Cliente"}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Nenhuma mensagem ainda
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input de Mensagem */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
