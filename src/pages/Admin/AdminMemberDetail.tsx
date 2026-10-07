import { ReactNode, useCallback, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { CalendarDays, FileText, LifeBuoy, ShieldOff, UserCheck } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { adminMembersService, apiErrorMessage, apiErrorStatus } from "../../lib/adminServices";
import { useAdminQuery } from "../../hooks/useAdminQuery";
import { useCommunityAccess } from "../../hooks/useCommunityAccess";
import { PERMISSIONS } from "../../lib/communityAccess";
import { AdminPageHeader, Card, ConfirmDialog, EmptyState, ErrorState, InlineError, LoadingBlock, TableScroll, TextAreaField, tdClass, thClass } from "./components/AdminUi";
import {
  describeUserAgent,
  formatDate,
  formatDateTime,
  humanize,
  memberName,
  memberStatusInfo,
  registrationInfo,
  resultInfo,
  severityInfo,
  userTypeLabel,
} from "./adminFormat";

const GENDER_LABELS: Record<string, string> = { male: "Homme", female: "Femme", M: "Homme", F: "Femme", homme: "Homme", femme: "Femme" };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-gray-800 dark:text-white/90">{children || "—"}</dd>
    </div>
  );
}

export default function AdminMemberDetail() {
  const { id = "" } = useParams();
  const { hasPermission } = useCommunityAccess();
  const canManage = hasPermission(PERMISSIONS.userManage);

  const fetchMember = useCallback(() => adminMembersService.get(id), [id]);
  const { data: member, error, loading, reload } = useAdminQuery(fetchMember);

  const [dialog, setDialog] = useState<"suspend" | "reactivate" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const closeDialog = () => {
    setDialog(null);
    setReason("");
    setActionError(null);
  };

  const confirm = async () => {
    if (!dialog) return;
    setBusy(true);
    setActionError(null);
    try {
      await adminMembersService.setStatus(id, dialog === "suspend" ? "SUSPENDED" : "ACTIVE", reason.trim());
      toast.success(dialog === "suspend" ? "Compte suspendu : ses sessions ont été fermées." : "Compte réactivé.");
      closeDialog();
      await reload(true);
    } catch (err) {
      setActionError(apiErrorMessage(err, "L'action n'a pas pu être effectuée."));
    } finally {
      setBusy(false);
    }
  };

  const notFound = apiErrorStatus(error) === 404;

  if (loading && !member) {
    return <LoadingBlock />;
  }
  if (!member) {
    return (
      <>
        <AdminPageHeader title={notFound ? "Membre introuvable" : "Membre"} backTo="/admin/membres" backLabel="Retour aux membres" />
        <Card>
          {notFound ? (
            <EmptyState title="Membre introuvable" description="Ce compte n'existe pas ou n'existe plus." />
          ) : (
            <ErrorState message={apiErrorMessage(error, "Ce membre n'a pas pu être chargé.")} onRetry={() => void reload()} />
          )}
        </Card>
      </>
    );
  }

  const name = memberName(member) || member.email;
  const st = memberStatusInfo(member.status);
  const reg = registrationInfo(member.registrationStatus);
  const suspended = member.status === "SUSPENDED";
  const activeSessions = member.sessions.filter((s) => !s.revokedAt).length;

  return (
    <>
      <PageMeta title={`${name} | Administration Poramma`} description="Fiche d'un membre de la communauté." />
      <AdminPageHeader
        title={name}
        description={member.email}
        backTo="/admin/membres"
        backLabel="Retour aux membres"
        actions={
          canManage &&
          (suspended ? (
            <Button size="sm" variant="outline" onClick={() => setDialog("reactivate")} startIcon={<UserCheck className="h-4 w-4" />}>
              Réactiver le compte
            </Button>
          ) : (
            <Button size="sm" onClick={() => setDialog("suspend")} startIcon={<ShieldOff className="h-4 w-4" />} className="bg-error-500! hover:bg-error-600!">
              Suspendre le compte
            </Button>
          ))
        }
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={st.color}>{st.label}</Badge>
          <Badge color={reg.color}>Enregistrement : {reg.label}</Badge>
          {member.inue && <Badge color="brand">INUE {member.inue}</Badge>}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Identité et profil</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Prénom">{member.firstName}</Field>
              <Field label="Nom">{member.lastName}</Field>
              <Field label="Email">
                {member.email} {member.emailVerified ? <Badge color="success" size="xs">vérifié</Badge> : <Badge color="warning" size="xs">non vérifié</Badge>}
              </Field>
              <Field label="Téléphone">
                {member.phone}
                {member.phone && (member.phoneVerified ? <> <Badge color="success" size="xs">vérifié</Badge></> : <> <Badge color="light" size="xs">non vérifié</Badge></>)}
              </Field>
              <Field label="Profil">{userTypeLabel(member.userType)}</Field>
              <Field label="Genre">{member.gender ? GENDER_LABELS[member.gender] ?? humanize(member.gender) : null}</Field>
              <Field label="Date de naissance">{member.birthDate ? formatDate(member.birthDate) : null}</Field>
              <Field label="Nationalité">{member.nationality}</Field>
              <Field label="Adresse">{member.address}</Field>
              <Field label="Ville / pays">{[member.city, member.country].filter(Boolean).join(", ")}</Field>
              <Field label="Compte créé le">{formatDateTime(member.createdAt)}</Field>
              <Field label="Dernière modification">{formatDateTime(member.updatedAt)}</Field>
              <Field label="Dossier d'enregistrement soumis le">{member.submittedAt ? formatDateTime(member.submittedAt) : null}</Field>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">Activité sur la plateforme</h2>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Seuls les volumes sont visibles : le contenu des dossiers reste réservé à l'ambassade.</p>
            <ul className="space-y-3">
              {[
                { label: "Demandes", value: member.counts.demandes, icon: FileText },
                { label: "Rendez-vous", value: member.counts.rendezVous, icon: CalendarDays },
                { label: "Tickets de support", value: member.counts.tickets, icon: LifeBuoy },
              ].map(({ label, value, icon: Icon }) => (
                <li key={label} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-white/[0.03]">
                  <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {label}
                  </span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{value.toLocaleString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between gap-2 px-5 pt-5">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Sessions</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activeSessions} active{activeSessions > 1 ? "s" : ""}
            </span>
          </div>
          {member.sessions.length === 0 ? (
            <EmptyState title="Aucune session enregistrée" />
          ) : (
            <TableScroll>
              <table className="mt-3 min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <caption className="sr-only">Sessions du membre</caption>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Appareil</th>
                    <th scope="col" className={thClass}>Adresse IP</th>
                    <th scope="col" className={thClass}>Ouverte le</th>
                    <th scope="col" className={thClass}>Rester connecté</th>
                    <th scope="col" className={thClass}>État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {member.sessions.map((s) => (
                    <tr key={s.id}>
                      <td className={tdClass}>
                        <span title={s.userAgent ?? undefined}>{describeUserAgent(s.userAgent)}</span>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap font-mono text-xs`}>{s.ip ?? "—"}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(s.createdAt)}</td>
                      <td className={tdClass}>{s.rememberMe ? "Oui" : "Non"}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>
                        {s.revokedAt ? <Badge color="light" size="sm">Fermée le {formatDateTime(s.revokedAt)}</Badge> : <Badge color="success" size="sm">Active</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          )}
        </Card>

        <Card>
          <h2 className="px-5 pt-5 text-base font-semibold text-gray-800 dark:text-white/90">Activité récente</h2>
          {member.recentActivity.length === 0 ? (
            <EmptyState title="Aucune activité récente" />
          ) : (
            <TableScroll>
              <table className="mt-3 min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <caption className="sr-only">Activité récente du membre</caption>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Date</th>
                    <th scope="col" className={thClass}>Action</th>
                    <th scope="col" className={thClass}>Objet</th>
                    <th scope="col" className={thClass}>Résultat</th>
                    <th scope="col" className={thClass}>Gravité</th>
                    <th scope="col" className={thClass}>Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {member.recentActivity.map((a) => {
                    const res = resultInfo(a.result);
                    const sev = severityInfo(a.severity);
                    return (
                      <tr key={a.id}>
                        <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(a.at)}</td>
                        <td className={`${tdClass} whitespace-nowrap font-mono text-xs`}>{a.action}</td>
                        <td className={`${tdClass} whitespace-nowrap text-xs`}>{a.entityType ?? "—"}</td>
                        <td className={tdClass}>
                          <Badge color={res.color} size="sm">{res.label}</Badge>
                        </td>
                        <td className={tdClass}>
                          <Badge color={sev.color} size="sm">{sev.label}</Badge>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap font-mono text-xs`}>{a.ip ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={dialog === "suspend"}
        title="Suspendre ce compte ?"
        confirmLabel="Suspendre le compte"
        danger
        busy={busy}
        onConfirm={() => void confirm()}
        onCancel={closeDialog}
      >
        <p>
          <strong className="text-gray-800 dark:text-white/90">{name}</strong> ne pourra plus se connecter. <strong>Toutes ses sessions ouvertes seront fermées immédiatement.</strong>
        </p>
        <div>
          <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Motif (conservé dans le journal d'audit)
          </p>
          <TextAreaField id="suspend-reason" label="Motif de la suspension" rows={3} value={reason} onChange={setReason} maxLength={500} placeholder="Ex. : comportement contraire aux conditions d'utilisation" />
        </div>
        {actionError && <InlineError>{actionError}</InlineError>}
      </ConfirmDialog>

      <ConfirmDialog open={dialog === "reactivate"} title="Réactiver ce compte ?" confirmLabel="Réactiver le compte" busy={busy} onConfirm={() => void confirm()} onCancel={closeDialog}>
        <p>
          <strong className="text-gray-800 dark:text-white/90">{name}</strong> pourra de nouveau se connecter à la plateforme.
        </p>
        {actionError && <InlineError>{actionError}</InlineError>}
      </ConfirmDialog>
    </>
  );
}
