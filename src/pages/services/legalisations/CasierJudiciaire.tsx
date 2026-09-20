import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCasierJudiciaire() {


  return (
    <>
      <PageMeta
        title="Légalisation casier judiciaire"
        description="Service de légalisation d'un casier judiciaire."
      />
      <PageBreadcrumb pageTitle="Légalisation casier judiciaire" />
      <ServiceView subServiceId="sub-022" />
    </>
  );
}
