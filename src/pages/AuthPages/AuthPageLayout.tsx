import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}

        {/* SECTION VISUELLE AMBASSADE */}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-gradient-to-br from-green-600 via-yellow-500 to-red-600 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />

            <div className="flex flex-col items-center max-w-xs px-6 text-center">
              <Link to="/" className="block mb-4">
                <img
                  width={231}
                  height={48}
                  src="/images/logo/fivision-logo.svg" // Remplace après
                  alt="Logo Fivision"
                />
              </Link>

              <p className="text-white text-sm font-medium leading-relaxed">
                Plateforme officielle des <strong>services consulaires</strong> <br />
                de l’ambassade du Mali à l’étranger
              </p>

              <div className="mt-4 text-white/80 text-xs">
                Accès sécurisé, rapide, et conforme aux normes diplomatiques
              </div>
            </div>
          </div>
        </div>

        {/* TOGGLER */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
