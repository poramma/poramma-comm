// src/pages/services/nationalite/index.tsx
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function Nationalite() {


  return (
    <>
      <PageMeta
        title="Certificat de nationalité"
        description="Demande de certificat de nationalité malienne."
      />
      <PageBreadcrumb pageTitle="Certificat de nationalité" />
      <ServiceView subServiceId="sub-018" />
    </>
  );
}
