import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCopiePasseport() {


  return (
    <>
      <PageMeta
        title="Légalisation copie du passeport"
        description="Service de légalisation d'une copie de passeport."
      />
      <PageBreadcrumb pageTitle="Légalisation copie du passeport" />
      <ServiceView subServiceId="sub-024" />
    </>
  );
}
