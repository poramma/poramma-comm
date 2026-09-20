import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function RetraitCarteBiometrique() {


  return (
    <>
      <PageMeta title="Retrait Carte Biométrique" description="Procédure de retrait de la carte biométrique sécurisée" />
      <PageBreadcrumb pageTitle="Retrait Carte Biométrique Sécurisée" />
      <ServiceView subServiceId="sub-005" />
    </>
  );
}
