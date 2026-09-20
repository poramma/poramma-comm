import { Navigate } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import WorkerProfileCard from "../components/UserProfile/WorkerProfileCard";
import StudentProfileCard from "../components/UserProfile/StudentProfileCard";

export default function UserProfiles() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace state={{ from: "/profile" }} />;

  // Seule la rubrique correspondant à la situation de l'usager est affichée
  // (les autres ne le concernent pas et ne seraient jamais renseignées).
  const userType = user.profile?.userType;

  return (
    <>
      <PageMeta
        title="Mon profil"
        description="Consultez et mettez à jour vos informations personnelles."
      />
      <PageBreadcrumb pageTitle="Mon profil" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
          {userType === "student" && <StudentProfileCard />}
          {userType === "worker" && <WorkerProfileCard />}
        </div>
      </div>
    </>
  );
}
