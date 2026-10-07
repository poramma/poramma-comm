import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/** Coque commune des pages /admin/* : un seul conteneur de toasts pour toute l'administration. */
export default function AdminShell() {
  return (
    <>
      <ToastContainer />
      <div className="px-2 pb-6 md:px-0">
        <Outlet />
      </div>
    </>
  );
}
