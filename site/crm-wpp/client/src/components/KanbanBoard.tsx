import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { useState } from "react";
import ChatModal from "./ChatModal";

export default function KanbanBoard() {
  const { data: contacts, isLoading } = trpc.contacts.list.useQuery();
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);

  if (isLoading) {
    return <div className="p-8">Carregando contatos...</div>;
  }

  const stages = ["lead", "negociacao", "fechado", "perdido"] as const;
  const stageLabels = {
    lead: "Leads",
    negociacao: "Negociação",
    fechado: "Fechado",
    perdido: "Perdido",
  };

  const stageColors = {
    lead: "bg-blue-50 border-blue-200",
    negociacao: "bg-amber-50 border-amber-200",
    fechado: "bg-green-50 border-green-200",
    perdido: "bg-red-50 border-red-200",
  };

  const stageBadgeColors = {
    lead: "bg-blue-100 text-blue-800",
    negociacao: "bg-amber-100 text-amber-800",
    fechado: "bg-green-100 text-green-800",
    perdido: "bg-red-100 text-red-800",
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => {
          const stageContacts = contacts?.filter((c) => c.stage === stage) || [];

          return (
            <div key={stage} className={`border rounded-lg p-4 ${stageColors[stage]}`}>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{stageLabels[stage]}</h3>
                <p className="text-sm text-gray-500">{stageContacts.length} contatos</p>
              </div>

              <div className="space-y-3">
                {stageContacts.map((contact) => (
                  <Card key={contact.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                        </div>

                        {contact.tags && (
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(contact.tags || "[]").map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => {
                            setSelectedContact(contact.id);
                            setShowChat(true);
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {stageContacts.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Nenhum contato nesta etapa</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showChat && selectedContact && (
        <ChatModal
          contactId={selectedContact}
          onClose={() => {
            setShowChat(false);
            setSelectedContact(null);
          }}
        />
      )}
    </>
  );
}
