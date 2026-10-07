import { FormEvent, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { Info, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { adminTeamService, apiErrorMessage } from "../../lib/adminServices";
import type { TeamMember, TeamRole } from "../../lib/adminTypes";
import { useAuth } from "../../context/AuthContext";
import { useAdminQuery } from "../../hooks/useAdminQuery";
import { useCommunityAccess } from "../../hooks/useCommunityAccess";
import { PERMISSIONS } from "../../lib/communityAccess";
import { emailError } from "../../lib/email";
import { AdminPageHeader, Card, ConfirmDialog, EmptyState, ErrorState, InlineError, InputField, LoadingBlock, SelectField, TableScroll, fieldClass, tdClass, thClass } from "./components/AdminUi";
import { TEAM_ROLE_LABELS, formatDate, memberStatusInfo } from "./adminFormat";

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: "COMMUNITY_ADMIN", label: TEAM_ROLE_LABELS.COMMUNITY_ADMIN },
  { value: "COMMUNITY_SUPPORT", label: TEAM_ROLE_LABELS.COMMUNITY_SUPPORT },
];

type Pending = { kind: "role"; member: TeamMember; role: TeamRole } | { kind: "remove"; member: TeamMember } | null;

export default function AdminTeam() {
  const { user } = useAuth();
  const { hasPermission } = useCommunityAccess();
  const canManage = hasPermission(PERMISSIONS.teamManage);

  const fetchTeam = useCallback(() => adminTeamService.list(), []);
  const { data: team, error, loading, reload } = useAdminQuery(fetchTeam);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("COMMUNITY_SUPPORT");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const problem = emailError(email, true);
    if (problem) {
      setAddError(problem);
      return;
    }
    setAdding(true);
    try {
      await adminTeamService.add(email.trim(), role);
      toast.success("Membre ajouté à l'équipe.");
      setEmail("");
      await reload(true);
    } catch (err) {
      // 404 : la personne n'a pas encore de compte — on affiche le message du serveur tel quel.
      setAddError(apiErrorMessage(err, "L'ajout a échoué."));
    } finally {
      setAdding(false);
    }
  };

  const closePending = () => {
    setPending(null);
    setPendingError(null);
  };

  const confirmPending = async () => {
    if (!pending) return;
    setBusy(true);
    setPendingError(null);
    try {
      if (pending.kind === "role") {
        await adminTeamService.changeRole(pending.member.userId, pending.role);
        toast.success("Rôle modifié.");
      } else {
        await adminTeamService.remove(pending.member.userId);
        toast.success("Accès retiré à l'équipe.");
      }
      closePending();
      await reload(true);
    } catch (err) {
      // 409 (dernier administrateur) et 403 : message du serveur affiché dans la boîte.
      setPendingError(apiErrorMessage(err, "L'action n'a pas pu être effectuée."));
    } finally {
      setBusy(false);
    }
  };

  const memberLabel = (m: TeamMember) => m.name || m.email;

  return (
    <>
      <PageMeta title="Équipe | Administration Poramma" description="Équipe d'administration de la communauté Poramma." />
      <AdminPageHeader title="Équipe d'administration" description="Les personnes qui administrent la plateforme communautaire. Elles doivent déjà avoir un compte Poramma." />

      <Card className="mb-4 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white/90">
          <Info className="h-4 w-4 text-brand-500" aria-hidden="true" />
          Les deux rôles
        </h2>
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-800 dark:text-white/90">Administrateur communauté</dt>
            <dd className="mt-1 text-gray-600 dark:text-gray-400">Accès complet : tableau de bord, membres (y compris suspension), journal d'audit et exports, support, système et gestion de l'équipe.</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-800 dark:text-white/90">Support communauté</dt>
            <dd className="mt-1 text-gray-600 dark:text-gray-400">Tableau de bord et système en lecture, consultation des membres, traitement des tickets de support. Pas d'accès au journal d'audit ni à l'équipe, et aucune action sur les comptes.</dd>
          </div>
        </dl>
      </Card>

      {canManage && (
        <Card className="mb-4 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white/90">
            <UserPlus className="h-4 w-4 text-brand-500" aria-hidden="true" />
            Ajouter une personne
          </h2>
          <form onSubmit={(e) => void add(e)} noValidate className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_16rem_auto] sm:items-end">
            <InputField label="Adresse email du compte" type="email" value={email} onChange={setEmail} placeholder="prenom.nom@exemple.com" />
            <SelectField label="Rôle" value={role} onChange={(v) => setRole(v as TeamRole)} options={ROLE_OPTIONS} />
            <Button type="submit" size="md" disabled={adding || !email.trim()} startIcon={<UserPlus className="h-4 w-4" />}>
              {adding ? "Ajout…" : "Ajouter"}
            </Button>
          </form>
          {addError && (
            <div className="mt-3">
              <InlineError>{addError}</InlineError>
            </div>
          )}
        </Card>
      )}

      <Card>
        {loading && !team && <LoadingBlock />}
        {error != null && !team && <ErrorState message={apiErrorMessage(error, "L'équipe n'a pas pu être chargée.")} onRetry={() => void reload()} />}
        {team && team.length === 0 && <EmptyState icon={ShieldCheck} title="Aucun membre dans l'équipe" />}
        {team && team.length > 0 && (
          <TableScroll>
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <caption className="sr-only">Équipe d'administration</caption>
              <thead>
                <tr>
                  <th scope="col" className={thClass}>Personne</th>
                  <th scope="col" className={thClass}>Rôle</th>
                  <th scope="col" className={thClass}>Compte</th>
                  <th scope="col" className={thClass}>Depuis le</th>
                  {canManage && (
                    <th scope="col" className={thClass}>
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {team.map((m) => {
                  const st = memberStatusInfo(m.status);
                  const isMe = m.userId === user?.id;
                  return (
                    <tr key={m.userId}>
                      <td className={tdClass}>
                        <span className="block font-medium text-gray-800 dark:text-white/90">
                          {m.name || m.email}
                          {isMe && <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">(vous)</span>}
                        </span>
                        {m.name && <span className="block break-all text-xs text-gray-500 dark:text-gray-400">{m.email}</span>}
                      </td>
                      <td className={tdClass}>
                        {canManage ? (
                          <>
                            <label htmlFor={`role-${m.userId}`} className="sr-only">
                              Rôle de {memberLabel(m)}
                            </label>
                            <select
                              id={`role-${m.userId}`}
                              value={m.role}
                              disabled={isMe}
                              title={isMe ? "Vous ne pouvez pas modifier votre propre rôle" : undefined}
                              onChange={(e) => e.target.value !== m.role && setPending({ kind: "role", member: m, role: e.target.value as TeamRole })}
                              className={`${fieldClass} h-9 min-w-[13rem]`}
                            >
                              {ROLE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <Badge color={m.role === "COMMUNITY_ADMIN" ? "brand" : "info"} size="sm">
                            {TEAM_ROLE_LABELS[m.role] ?? m.role}
                          </Badge>
                        )}
                      </td>
                      <td className={tdClass}>
                        <Badge color={st.color} size="sm">{st.label}</Badge>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(m.assignedAt)}</td>
                      {canManage && (
                        <td className={`${tdClass} text-right`}>
                          {!isMe && (
                            <button
                              type="button"
                              onClick={() => setPending({ kind: "remove", member: m })}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-500/10"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Retirer
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>
        )}
      </Card>

      <ConfirmDialog
        open={pending?.kind === "role"}
        title="Changer le rôle ?"
        confirmLabel="Changer le rôle"
        busy={busy}
        onConfirm={() => void confirmPending()}
        onCancel={closePending}
      >
        {pending?.kind === "role" && (
          <>
            <p>
              <strong className="text-gray-800 dark:text-white/90">{memberLabel(pending.member)}</strong> deviendra « {TEAM_ROLE_LABELS[pending.role]} ».
            </p>
            <p>La personne devra se reconnecter pour que son nouveau rôle soit pris en compte.</p>
            {pendingError && <InlineError>{pendingError}</InlineError>}
          </>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={pending?.kind === "remove"}
        title="Retirer l'accès à l'équipe ?"
        confirmLabel="Retirer l'accès"
        danger
        busy={busy}
        onConfirm={() => void confirmPending()}
        onCancel={closePending}
      >
        {pending?.kind === "remove" && (
          <>
            <p>
              <strong className="text-gray-800 dark:text-white/90">{memberLabel(pending.member)}</strong> n'aura plus accès à l'administration de la communauté. Son compte de membre n'est pas supprimé.
            </p>
            {pendingError && <InlineError>{pendingError}</InlineError>}
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
