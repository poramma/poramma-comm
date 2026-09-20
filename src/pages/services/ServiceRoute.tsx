import { Navigate, useParams } from "react-router-dom";
import ServiceView from "./ServiceView";

/** /services/demande/:subServiceId — ouvre n'importe quel service du catalogue (utilisé par « Nouvelle demande »). */
export default function ServiceRoute() {
  const { subServiceId } = useParams();
  if (!subServiceId) return <Navigate to="/services/nouvelle-demande" replace />;
  return <ServiceView key={subServiceId} subServiceId={subServiceId} />;
}
