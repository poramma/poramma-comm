import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function FicheIndividuelleNINA() {


  return (
    <>
      <PageMeta title="Fiche Individuelle NINA" description="Demande de fiche individuelle NINA" />
      <PageBreadcrumb pageTitle="Fiche Individuelle NINA" />
      <ServiceView subServiceId="sub-002" />
    </>
  );
}
