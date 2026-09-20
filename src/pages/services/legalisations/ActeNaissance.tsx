import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationActeNaissance() {


  return (
    <>
      <PageMeta
        title="Légalisation acte de naissance"
        description="Service de légalisation d'acte de naissance."
      />
      <PageBreadcrumb pageTitle="Légalisation acte de naissance" />
      <ServiceView subServiceId="sub-020" />
    </>
  );
}
