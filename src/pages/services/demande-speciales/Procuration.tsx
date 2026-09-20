import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function Procuration() {


  return (
    <>
      <PageMeta
        title="Demande de Procuration"
        description="Formulaire et étapes pour la demande de procuration."
      />
      <PageBreadcrumb pageTitle="Procuration" />
      <ServiceView subServiceId="sub-029" />
    </>
  );
}
