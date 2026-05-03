import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../../components/ui/avatar/Avatar";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import type { Agent, ServiceItem } from "../../pages/appointments/BookAppointement";
import AgentTooltip from "./AgentTooltip";

type Props = {
  service: ServiceItem;
  agents: Agent[];
  selectedAgentId?: string;
  onSelectAgent: (a: Agent) => void;
};

const AgentAvailability: React.FC<Props> = ({
  service,
  agents,
  selectedAgentId,
  onSelectAgent,
}) => {
  const [hoveredAgentId, setHoveredAgentId] = React.useState<string | null>(null);

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-full text-white bg-brand-500">
            2
          </div>
          Choisissez un agent pour{" "}
          <span className="text-brand-600">{service.name}</span>
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence initial={false}>
          {agents.map((ag) => {
            const active = ag.id === selectedAgentId;
            const available = Object.values(ag.agenda).some(
              (slots) => (slots?.length ?? 0) > 0
            );

            return (
              <motion.div
                key={ag.id}
                layout
                className={`rounded-xl border p-4 transition
                  ${
                    active
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-gray-200 dark:border-gray-800"
                  }
                `}
              >
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredAgentId(ag.id)}
                  onMouseLeave={() => setHoveredAgentId(null)}
                >
                  {/* Bloc agent */}
                  <div className="flex items-center gap-3">
                    <Avatar name={ag.name} src={ag.avatarUrl ?? ""} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {ag.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {ag.role}
                      </div>
                    </div>
                    <Badge variant={available ? "solid" : "outline"}>
                      {available ? "Disponible" : "Complet"}
                    </Badge>
                  </div>

                  {/* Tooltip */}
                  <AgentTooltip
                    name={ag.name}
                    role={ag.role}
                    visible={hoveredAgentId === ag.id}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {available
                      ? "Créneaux ouverts cette semaine"
                      : "Aucun créneau libre"}
                  </div>
                  <Button
                    size="sm"
                    variant={active ? "primary" : "outline"}
                    onClick={() => onSelectAgent(ag)}
                  >
                    {active ? "Sélectionné" : "Choisir"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AgentAvailability;
