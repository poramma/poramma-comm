// src/pages/services/carte-consulaire/Renouvellement.tsx
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function CarteConsulaireRenouvellement() {


    return (
    <>
        <PageMeta
            title="Renouvellement Carte Consulaire"
            description="Renouvellement de la carte consulaire avec les étapes et documents requis."
        />
        <PageBreadcrumb pageTitle="Renouvelle Carte Consulaire" />
        <ServiceView subServiceId="sub-011"
        />
    </>
  );
}
