import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ServiceView from "../ServiceView";

export default function LegalisationCertificatNationalite() {


  return (
    <>
      <PageMeta
        title="Légalisation certificat de nationalité"
        description="Service de légalisation d'un certificat de nationalité."
      />
      <PageBreadcrumb pageTitle="Légalisation certificat de nationalité" />
      <ServiceView subServiceId="sub-021" />
    </>
  );
}
