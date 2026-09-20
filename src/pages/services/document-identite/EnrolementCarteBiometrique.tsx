import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function EnrolementCarteBiometrique() {


  return (
    <>
      <PageMeta title="Enrôlement Carte Biométrique" description="Procédure d'enrôlement pour la carte biométrique" />
      <PageBreadcrumb pageTitle="Enrôlement Carte Biométrique" />
      <ServiceView subServiceId="sub-004" />
    </>
  );
}
