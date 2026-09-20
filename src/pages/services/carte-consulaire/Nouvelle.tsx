// src/pages/services/carte-consulaire/Nouvelle.tsx
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function CarteConsulaireNouvelle() {


  return (
    <>
        <PageMeta
            title="Nouvelle Carte Consulaire"
            description="Demande de nouvelle carte consulaire avec les étapes et documents requis."
        />
        <PageBreadcrumb pageTitle=" Nouvelle Carte Consulaire" />
        <ServiceView subServiceId="sub-010"
        />
    </>
  );
}
