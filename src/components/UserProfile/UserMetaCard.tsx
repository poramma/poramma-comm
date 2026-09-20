import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRegistration } from "../../context/RegistrationContext";
import { userService } from "../../lib/services";
import type { FullUserProfile, RegistrationStatus } from "../../lib/types";
import Badge from "../ui/badge/Badge";

const TYPE_LABELS: Record<string, string> = {
  student: "Étudiant(e)",
  worker: "Travailleur(se)",
  migrant: "Migrant(e)",
  other: "Membre de la communauté",
};

const REGISTRATION_BADGES: Record<RegistrationStatus, { label: string; color: "success" | "warning" | "error" | "info" }> = {
  INCOMPLETE: { label: "Enregistrement à compléter", color: "info" },
  SUBMITTED: { label: "Dossier en cours d'examen", color: "warning" },
  VALIDATED: { label: "Dossier validé", color: "success" },
  REJECTED: { label: "Dossier à corriger", color: "error" },
  SUSPENDED: { label: "Dossier suspendu", color: "error" },
};

/** Champs pris en compte dans la complétude du profil : [libellé, valeur renseignée ?]. */
function completeness(p: FullUserProfile | null): { percent: number; missing: string[] } {
  if (!p) return { percent: 0, missing: [] };
  const checks: [string, boolean][] = [
    ["prénom", !!p.personalInfo.firstName],
    ["nom", !!p.personalInfo.lastName],
    ["téléphone", !!p.personalInfo.phone],
    ["genre", !!p.personalInfo.gender],
    ["date de naissance", !!p.personalInfo.birthDate],
    ["adresse", !!p.address.address],
    ["ville", !!p.address.city],
    ["pays", !!p.address.country],
  ];
  if (p.userType === "student") {
    checks.push(["université", !!p.studentProfile?.university], ["filière", !!p.studentProfile?.faculty], ["niveau d'études", !!p.studentProfile?.studyLevel]);
  }
  if (p.userType === "worker") {
    checks.push(["employeur", !!p.workerProfile?.employer], ["profession", !!p.workerProfile?.profession]);
  }
  const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
  return { percent: Math.round(((checks.length - missing.length) / checks.length) * 100), missing };
}

/** En-tête du profil : identité réelle, INUE, état du dossier d'enregistrement et complétude des informations. */
export default function UserMetaCard() {
  const { user } = useAuth();
  const { registration } = useRegistration();
  const [profile, setProfile] = useState<FullUserProfile | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    userService.getProfile(user.id).then(setProfile).catch(() => setProfile(null));
  }, [user?.id]);

  const firstName = profile?.personalInfo.firstName ?? user?.profile?.firstName ?? "";
  const lastName = profile?.personalInfo.lastName ?? user?.profile?.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "") || (user?.email?.[0] ?? "?")).toUpperCase();
  const userType = profile?.userType ?? user?.profile?.userType ?? "other";
  const location = [profile?.address.city, profile?.address.country].filter(Boolean).join(", ");
  const phone = profile?.personalInfo.phone || user?.phone || "";
  const inue = registration?.inue ?? profile?.inue ?? user?.profile?.inue ?? null;
  const regBadge = registration ? REGISTRATION_BADGES[registration.registrationStatus] : null;
  const { percent, missing } = completeness(profile);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-500 text-2xl font-semibold text-white">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">{fullName}</h4>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{TYPE_LABELS[userType] ?? TYPE_LABELS.other}</p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {user?.email}
              </span>
              {phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {phone}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {inue ? (
                <Badge color="success" variant="light" startIcon={<ShieldCheck className="h-4 w-4" />}>
                  INUE : {inue}
                </Badge>
              ) : (
                <Badge color="light" variant="light">
                  INUE non attribué
                </Badge>
              )}
              {regBadge && (
                <Badge color={regBadge.color} variant="light">
                  {regBadge.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/settings"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <Settings className="h-4 w-4" />
          Paramètres du compte
        </Link>
      </div>

      {profile && (
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Complétude de votre profil</span>
            <span className="font-semibold text-gray-800 dark:text-white/90">{percent} %</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
          {missing.length > 0 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">À renseigner : {missing.join(", ")}.</p>
          )}
        </div>
      )}
    </div>
  );
}
