import React, { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";



// Types partagés
export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
};

export type Agent = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  services: string[]; // liste des serviceIds couverts
  // agenda = map de 'YYYY-MM-DD' -> liste d'heures "HH:mm"
  agenda: Record<string, string[]>;
};

// --- MOCK DATA (à remplacer par fetch API si besoin)
import { UserCircle } from "lucide-react";
import AgentAvailability from "../../components/appointments/AgentAvailability";
import AppointmentSummary from "../../components/appointments/AppointmentSummary";
import ServiceSelector from "../../components/appointments/ServiceSelector";
import TimeSlotPicker from "../../components/appointments/TimeSlotPicker";

const ALL_SERVICES: ServiceItem[] = [
  { id: "documents", name: "Documents Identité", description: "NINA, Fiche individuelle, Carte Biométrique", icon: <UserCircle className="w-5 h-5" /> },
  { id: "passeport", name: "Passeport", description: "Demande, renouvellement, mineur", icon: <UserCircle className="w-5 h-5" /> },
  { id: "carte-consulaire", name: "Carte consulaire", description: "Nouvelle, renouvellement", icon: <UserCircle className="w-5 h-5" /> },
  { id: "etat-civil", name: "État civil", description: "Naissance, mariage, décès", icon: <UserCircle className="w-5 h-5" /> },
  { id: "attestations", name: "Attestations", description: "Études, résidence, travail" , icon: <UserCircle className="w-5 h-5" /> },
  { id: "legalisation", name: "Légalisations", description: "Signature, documents", icon: <UserCircle className="w-5 h-5" /> },
  { id: "visa", name: "Visa & voyage", description: "3/6 mois, laissez-passer", icon: <UserCircle className="w-5 h-5" /> },
];

const makeAgenda = (): Record<string, string[]> => {
  // 7 jours, créneaux exemples
  const base = new Date();
  const days = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const slots = ["09:00", "09:30", "10:00", "11:00", "14:00", "14:30", "15:00", "16:30"];
  return Object.fromEntries(days.map((d) => [d, Math.random() > 0.15 ? slots : []]));
};

const ALL_AGENTS: Agent[] = [
  {
    id: "ag_1",
    name: "Aïssata Diarra",
    role: "Agent consulaire",
    avatarUrl: "/images/user/user-04.jpg",
    services: ["passeport", "carte-consulaire", "attestations"],
    agenda: makeAgenda(),
  },
  {
    id: "ag_2",
    name: "Ibrahima Coulibaly",
    role: "Responsable état civil",
    avatarUrl: "/images/user/user-05.jpg",
    services: ["etat-civil", "legalisation"],
    agenda: makeAgenda(),
  },
  {
    id: "ag_3",
    name: "Fatoumata Koné",
    role: "Agent visas",
    avatarUrl: "/images/user/user-04.jpg",
    services: ["visa", "passeport"],
    agenda: makeAgenda(),
  },
    {
        id: "ag_4",
        name: "Mamadou Traoré",
        role: "Agent administratif",
        avatarUrl: "/images/user/user-06.jpg",
        services: ["documents", "attestations"],
        agenda: makeAgenda(),
    },
    {
        id: "ag_5",
        name: "Seydou Keita",
        role: "Agent consulaire",
        avatarUrl: "/images/user/user-17.jpg",
        services: ["carte-consulaire", "visa"],
        agenda: makeAgenda(),
    },
    {
        id: "ag_6",
        name: "Mariama Doumbia",
        role: "Agent administratif",
        avatarUrl: "/images/user/user-21.jpg",
        services: ["etat-civil", "legalisation"],
        agenda: makeAgenda(),
    },
];

export default function BookAppointment() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // HH:mm

  const agentsForService = useMemo(() => {
    if (!selectedService) return [];
    return ALL_AGENTS.filter((a) => a.services.includes(selectedService.id));
  }, [selectedService]);

  const clearBelow = (level: "service" | "agent" | "slot") => {
    if (level === "service") {
      setSelectedAgent(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
    if (level === "agent") {
      setSelectedDate(null);
      setSelectedTime(null);
    }
    if (level === "slot") {
      setSelectedTime(null);
    }
  };

  const onConfirm = async (payload: {
    subject: string;
    description: string;
    notifyByEmail: boolean;
  }) => {
    if (!selectedService || !selectedAgent || !selectedDate || !selectedTime) return;

    const body = {
      serviceId: selectedService.id,
      agentId: selectedAgent.id,
      date: selectedDate,
      time: selectedTime,
      ...payload,
    };

    // 🔁 Remplace ce fetch par ton API réelle
    await new Promise((r) => setTimeout(r, 800));

    // Ici, tu peux afficher un toast de succès + redirection
    alert("✅ Rendez-vous confirmé !");
  };

  return (
    <>
      <PageMeta
        title="Prise de rendez-vous"
        description="Réservez un créneau avec un agent de l'ambassade."
      />
      <PageBreadcrumb pageTitle="Prise de rendez-vous" />

      <div className="p-6 space-y-6">
        {/* Étape 1 – Sélection service */}
        <ServiceSelector
          services={ALL_SERVICES}
          selectedId={selectedService?.id}
          onSelect={(srv) => {
            setSelectedService(srv);
            clearBelow("service");
          }}
        />

        {/* Étape 2 – Agents + agendas */}
        {selectedService && (
          <AgentAvailability
            key={selectedService.id}
            service={selectedService}
            agents={agentsForService}
            selectedAgentId={selectedAgent?.id}
            onSelectAgent={(ag) => {
              setSelectedAgent(ag);
              clearBelow("agent");
            }}
          />
        )}

        {/* Étape 3 – Créneaux */}
        {selectedAgent && (
          <TimeSlotPicker
            key={selectedAgent.id}
            agenda={selectedAgent.agenda}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onPickDate={(d) => {
              setSelectedDate(d);
              clearBelow("slot");
            }}
            onPickTime={setSelectedTime}
          />
        )}

        {/* Étape 4 – Récap + validation */}
        {selectedService && selectedAgent && selectedDate && selectedTime && (
          <AppointmentSummary
            service={selectedService}
            agent={selectedAgent}
            date={selectedDate}
            time={selectedTime}
            onConfirm={onConfirm}
          />
        )}
      </div>
    </>
  );
}
