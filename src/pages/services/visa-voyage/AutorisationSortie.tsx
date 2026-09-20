import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function AutorisationSortie() {


  return (
    <>
      <PageMeta
        title="Autorisation de sortie du territoire marocain"
        description="Demande d’autorisation de sortie du territoire marocain"
      />
      <PageBreadcrumb pageTitle="Autorisation de Sortie du Territoire Marocain" />
      <ServiceView subServiceId="sub-015" />
    </>
  );
}
