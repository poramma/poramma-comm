import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import WorkerProfileCard from "../components/UserProfile/WorkerProfileCard";
import StudentProfileCard from "../components/UserProfile/StudentProfileCard";

export default function UserProfiles() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/signin");
    return;
  }
  
  return (
    <>
      <PageMeta
        title="Profil utilisateur"
        description="Page de profil utilisateur pour afficher et gérer les informations personnelles."
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
          <StudentProfileCard />
          <WorkerProfileCard />
          {/*
          {user?.userType === 'other' && <WorkerProfileCard />}
          {user?.userType === 'other' && <StudentProfileCard />}
          */}
        </div>
      </div>
    </>
  );
}
