// src/pages/services/autorisation-parentale/index.tsx
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import ServiceView from "../../ServiceView";

export default function AutorisationParentale() {


  return (
    <>
      <PageMeta
        title="Autorisation parentale"
        description="Demande d’autorisation parentale."
      />
      <PageBreadcrumb pageTitle="Autorisation parentale" />
      <ServiceView subServiceId="sub-019" />
    </>
  );
}
