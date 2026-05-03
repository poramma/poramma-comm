import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  ChatIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { CheckSquareIcon, IdCardIcon, PlaneIcon } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    name: "Accueil",
    icon: <GridIcon />,
    path: "/dashboard",
  },
  {
    name:  "Mes demandes",
    icon: <ListIcon />,
    path: "/services/mesdemandes/gerer",
  },
  {
    name: "Documents d'identité",
    icon: <IdCardIcon />,
    subItems: [
      { name: "Enrôlement NINA", path: "/services/documents-identite/enrolement-nina" },
      { name: "Fiche individuelle NINA", path: "/services/documents-identite/fiche-individuelle-nina" },
      { name: "Fiche individuelle", path: "/services/documents-identite/fiche-etat-civil" },
      { name: "Enrôlement Carte Biométrique", path: "/services/documents-identite/enrolement-carte-biometrique" },
      { name: "Retrait carte Biométrique sécurisée", path: "/services/documents-identite/retrait-carte-biometrique" },
    ],
  },
  {
    name: "Passeport",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "Demande de Passeport", path: "/services/passeport/demande" },
      { name: "Passeport Ordinaire", path: "/services/passeport/ordinaire" },
      { name: "Retrait Passeport", path: "/services/passeport/retrait" },
      { name: "Renouvellement", path: "/services/passeport/renouvellement" },
      { name: "Passeport pour mineur", path: "/services/passeport/mineur" },
    ],
  },
  {
    name: "Carte consulaire",
    icon: <TableIcon />,
    subItems: [
      { name: "Nouvelle demande", path: "/services/carte-consulaire/nouvelle" },
      { name: "Renouvellement", path: "/services/carte-consulaire/renouvellement" },
    ],
  },
  {
    name: "Visa et voyage",
    icon: <PlaneIcon/>, 
    subItems: [
      { name: "Visa 3 mois", path: "/services/visa-voyage/visa-3mois" },
      { name: "Visa 6 mois", path: "/services/visa-voyage/visa-6mois" },
      { name: "Laissez-passer", path: "/services/visa-voyage/laissez-passer" },
      { name: "Autorisation sortie(Maroc)", path: "/services/visa-voyage/autorisation-sortie" },
    ],
  },
  {
    name: "Juridiques & Attestations",
    icon: <PageIcon />,
    subItems: [
      {
        name: "Attestations",
        path: "/services/attestations/attestation",
        pro: false,
      },
      {
        name: "Légalisation / Authentification",
        path: "/services/juridiques/legalisation",
      },
      {
        name: "Certificat de nationalité",
        path: "/services/juridiques/nationalite",
      },
      {
        name: "Autorisation parentale",
        path: "/services/autorisations/autorisation-parentale",
      },
    ],
  },
  {
    name: "Légalisations diverses",
    icon: <CheckSquareIcon />,
    subItems: [
      { name: "Légalisation acte de naissance", path: "/services/legalisations/acte-naissance" },
      { name: "Légalisation certificat de nationalité", path: "/services/legalisations/certificat-nationalite" },
      { name: "Légalisation casier judiciaire", path: "/services/legalisations/casier-judiciaire" },
      { name: "Légalisation casier judiciaire étudiant", path: "/services/legalisations/casier-judiciaire-etudiant" },
      { name: "Légalisation copie du passeport", path: "/services/legalisations/copie-passeport" },
    ],
  },

  {
    name: "Actes d’état civil",
    icon: <ListIcon />,
    subItems: [
      { name: "Acte de naissance", path: "/services/etat-civil/naissance" },
      { name: "Acte de mariage", path: "/services/etat-civil/mariage" },
      { name: "Acte de divorce", path: "/services/etat-civil/divorce" },
      { name: "Acte de décès", path: "/services/etat-civil/deces" },
    ],
  },
  {
    name: "Procurations",
    icon: <BoxCubeIcon />,
    subItems: [
      { name: "Mandats spéciaux", path: "/services/procurations/mandats-speciaux" },
      { name: "Retrait passeport", path: "/services/procurations/retrait-passeport" },
      { name: "Retrait carte biométrique", path: "/services/procurations/retrait-carte-biometrique" }
    ],
  },

  {
    name: "Demandes spéciales",
    icon: <BoxCubeIcon />,
    subItems: [
      { name: "Certificat de célibat", path: "/services/special/celibat" },
      { name: "Transfert de corps", path: "/services/special/transfert-corps" },
      { name: "Demande Particulière", path: "/services/special/particuliere" },
      
    ],
  },
];


const othersItems: NavItem[] = [
  {
    name: "Communauté",
    icon: <UserCircleIcon />, // À remplacer par une icône pertinente
    subItems: [
      { name: "Réseau des étudiants", path: "/community/reseau" },
      { name: "Événements", path: "/community/evenements" },
      { name: "Opportunités", path: "/community/opportunites" },
      { name: "Groupes et clubs", path: "/community/groupes" },
    ],
  },
  {
    name: "Espace étudiant",
    icon: <CalenderIcon />,
    subItems: [
      { name: "Demande de bourse", path: "/student/bourse" },
      { name: "Logement", path: "/student/logement" },
      { name: "Orientation", path: "/student/orientation" },
    ],
  },
  {
    name: "Messagerie",
    icon: <ChatIcon />,
    path: "/chat",
  },
  {
    name: "Profil utilisateur",
    icon: <UserCircleIcon />,
    path: "/profile",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/fivision-logo-icon.svg"
                alt="Logo"
                width={80}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/fivision-logo.svg"
                alt="Logo"
                width={80}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/fivision-logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Services Consulaires"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Autres"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        
      </div>
    </aside>
  );
};

export default AppSidebar;
