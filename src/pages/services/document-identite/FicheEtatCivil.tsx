import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function FicheEtatCivil() {


  return (
    <>
      <PageMeta title="Fiche Individuelle d'État Civil" description="Demande de fiche individuelle d'État civil" />
      <PageBreadcrumb pageTitle="Fiche Individuelle d'État Civil" />
      <ServiceView subServiceId="sub-003" />
    </>
  );
}
