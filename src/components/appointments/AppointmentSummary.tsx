import React, { useState } from "react";
import Button from "../../components/ui/button/Button";
import Textarea from "../form/input/TextArea";
import type { Agent, ServiceItem } from "../../pages/appointments/BookAppointement";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Input from "../form/input/InputField";
import { toast } from "react-toastify";

type Props = {
  service: ServiceItem;
  agent: Agent;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  onConfirm: (payload: { subject: string; description: string; notifyByEmail: boolean }) => Promise<void> | void;
};

const AppointmentSummary: React.FC<Props> = ({ service, agent, date, time, onConfirm }) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  const dtLabel = `${format(parseISO(date), "EEEE d MMMM yyyy", { locale: fr })} à ${time}`;

  const handleSubmit = async () => {
    if (!subject.trim()) {
      return false;
    }
    setLoading(true);
    try {
      await onConfirm({ subject, description, notifyByEmail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        <div
          className="w-8 h-8 flex items-center justify-center rounded-full text-white bg-brand-500"
        >
          4
        </div>
         Récapitulatif & validation</h2>

      <div className="mt-4 grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Service</div>
            <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Agent</div>
            <div className="font-medium text-gray-900 dark:text-white">{agent.name} — <span className="text-gray-600 dark:text-gray-300">{agent.role}</span></div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Date & heure</div>
            <div className="font-medium text-gray-900 dark:text-white">{dtLabel}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Motif du rendez-vous</label>
            <Input
              placeholder="Ex. Renouvellement de passeport (mineur)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            {subject.trim() === "" && (
              <p className="text-red-500 text-xs mt-1">Veuillez indiquer le motif du rendez-vous.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (facultatif)</label>
            <Textarea
              rows={4}
              placeholder="Ajoutez des précisions utiles pour l'agent…"
              value={description}
              onChange={setDescription}
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="size-4 rounded border-gray-300 dark:border-gray-700 bg-brand-500 focus:ring-brand-500/20"
              checked={notifyByEmail}
              onChange={(e) => setNotifyByEmail(e.target.checked)}
            />
            Recevoir un e-mail de confirmation
          </label>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Validation…" : "Valider le rendez-vous"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSummary;
