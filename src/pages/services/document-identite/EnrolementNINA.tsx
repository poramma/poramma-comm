// src/pages/services/documents-identite/EnrolementNINA.tsx
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function EnrolementNINA() {


  return (
    <>
      <PageMeta
        title="Enrôlement NINA"
        description="Procédure d'enrôlement NINA."
      />
      <PageBreadcrumb pageTitle="Enrôlement NINA" />
      <ServiceView subServiceId="sub-001"
      />
    </>
  );
}
