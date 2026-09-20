// src/pages/services/legalisation/index.tsx
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function Legalisation() {


  return (
    <>
      <PageMeta
        title="Légalisation / Authentification"
        description="Demande de légalisation ou authentification de documents."
      />
      <PageBreadcrumb pageTitle="Légalisation / Authentification" />
      <ServiceView subServiceId="sub-017" />
    </>
  );
}
