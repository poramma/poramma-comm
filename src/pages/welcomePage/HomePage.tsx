import React, { RefObject, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users, FileText, CalendarCheck, Banknote, Menu, X, LogOut } from 'lucide-react';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { useAuth } from '../../context/AuthContext';
import { EMBASSY_CONTACT } from '../../config/contact';

const LOGO_SRC = '/images/poramma-logo.png';

/** Où mène un clic sur un service du pied de page une fois connecté. */
const SERVICES_ENTRY = '/services/nouvelle-demande';

const FOOTER_SERVICES = ['Passeport', 'Carte consulaire', "Actes d'état civil", 'Visa'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const displayName = user?.profile ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ') : '';
  const shortName = user?.profile?.firstName || user?.email?.split('@')[0] || '';
  const initials = (displayName || user?.email || '?')
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    try {
      await logout();
    } catch {
      // la session locale est de toute façon effacée : l'en-tête repasse en mode déconnecté
    }
  };
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const setCurrentPage = (page: string) => {
    navigate(`/${page}`);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Les services ne sont accessibles qu'une fois connecté : sinon on passe par la page de connexion,
  // qui ramène ensuite l'usager là où il voulait aller.
  const openServices = () => {
    if (loading) return;
    if (user) {
      navigate(SERVICES_ENTRY);
    } else {
      navigate('/signin', { state: { from: SERVICES_ENTRY } });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center" aria-label="Poramma — accueil">
              <img src={LOGO_SRC} alt="Poramma" className="h-16 w-auto" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection(featuresRef as RefObject<HTMLDivElement>)}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection(stepsRef as RefObject<HTMLDivElement>)}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Comment ça marche
              </button>
              <button
                onClick={() => scrollToSection(valuesRef as RefObject<HTMLDivElement>)}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Nos valeurs
              </button>
              <button
                onClick={() => scrollToSection(ctaRef as RefObject<HTMLDivElement>)}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Contact
              </button>
              {loading ? (
                // Réserve la place pendant la lecture de la session : évite d'afficher « Connexion » à un usager déjà connecté.
                <div className="h-9 w-56" aria-hidden="true" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2" title={user.email}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">{initials}</span>
                    <span className="max-w-[140px] truncate text-sm font-medium text-gray-800">{shortName}</span>
                  </div>
                  <Button onClick={() => setCurrentPage('dashboard')} size="sm" endIcon={<ArrowRight size={16} />}>
                    Mon espace
                  </Button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    aria-label="Se déconnecter"
                    title="Se déconnecter"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Button onClick={() => setCurrentPage('signin')} variant="outline" size="sm">
                    Connexion
                  </Button>
                  <Button onClick={() => setCurrentPage('signup')} size="sm" endIcon={<ArrowRight size={16} />}>
                    S'inscrire
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-green-600"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-6 py-4 space-y-4">
              <button
                onClick={() => scrollToSection(featuresRef as RefObject<HTMLDivElement>)}
                className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection(stepsRef as RefObject<HTMLDivElement>)}
                className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
              >
                Comment ça marche
              </button>
              <button
                onClick={() => scrollToSection(valuesRef as RefObject<HTMLDivElement>)}
                className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
              >
                Nos valeurs
              </button>
              <button
                onClick={() => scrollToSection(ctaRef as RefObject<HTMLDivElement>)}
                className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
              >
                Contact
              </button>
              <div className="pt-4 space-y-3">
                {loading ? null : user ? (
                  <>
                    <div className="flex items-center gap-2 pb-1">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">{initials}</span>
                      <span className="truncate text-sm font-medium text-gray-800">{displayName || user.email}</span>
                    </div>
                    <Button onClick={() => setCurrentPage('dashboard')} className="w-full" endIcon={<ArrowRight size={16} />}>
                      Mon espace
                    </Button>
                    <Button onClick={handleLogout} variant="outline" className="w-full" startIcon={<LogOut size={16} />}>
                      Se déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setCurrentPage('signin')}
                      variant="outline"
                      className="w-full"
                    >
                      Connexion
                    </Button>
                    <Button
                      onClick={() => setCurrentPage('signup')}
                      className="w-full"
                      endIcon={<ArrowRight size={16} />}
                    >
                      S'inscrire
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 via-yellow-400 to-red-500 text-white overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4963437/pexels-photo-4963437.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="mb-8">
            <Badge color="success" variant="solid" size="md">
              La plateforme officielle de l'ambassade du Mali au Maroc
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Poramma, vos services consulaires en ligne
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Poramma réunit la communauté malienne du Maroc autour d'un espace unique : créez votre compte, complétez votre dossier, déposez vos demandes, prenez rendez-vous à l'ambassade et suivez chaque étape.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Button onClick={() => setCurrentPage('dashboard')} endIcon={<ArrowRight />}>
                Accéder à mon espace
              </Button>
            ) : (
              <>
                <Button onClick={() => setCurrentPage('signup')} endIcon={<ArrowRight />}>
                  Rejoindre Poramma
                </Button>
                <Button onClick={() => setCurrentPage('signin')} variant="outline">
                  Se connecter
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-2">Ce que Poramma vous apporte</h2>
            <p className="text-gray-600 text-lg">
              Vos démarches auprès de l'ambassade, sans file d'attente inutile ni déplacement superflu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Demandes en ligne',
                description: "Passeport, carte consulaire, actes d'état civil, légalisations… déposez votre dossier avec vos pièces justificatives.",
                color: 'success',
              },
              {
                icon: Clock,
                title: 'Suivi en temps réel',
                description: "Chaque changement d'état de votre dossier vous est notifié dans l'application et par email.",
                color: 'warning',
              },
              {
                icon: CalendarCheck,
                title: "Rendez-vous à l'ambassade",
                description: 'Réservez un créneau, déplacez-le ou annulez-le, puis téléchargez votre ticket.',
                color: 'error',
              },
              {
                icon: Users,
                title: "Échanges avec l'ambassade",
                description: "Un complément d'information est demandé ? Répondez directement depuis votre dossier.",
                color: 'info',
              },
              {
                icon: Shield,
                title: 'Données protégées',
                description: "Votre dossier n'est accessible qu'à vous et aux agents habilités de l'ambassade.",
                color: 'primary',
              },
              {
                icon: Banknote,
                title: "Paiement à l'ambassade",
                description: "Aucun paiement en ligne : les frais éventuels se règlent sur place, à l'ambassade.",
                color: 'dark',
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <Badge color={feature.color as React.ComponentProps<typeof Badge>['color']} variant="light" startIcon={<feature.icon className="h-5 w-5" />}>
                  {feature.title}
                </Badge>
                <p className="mt-4 text-gray-700 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section ref={stepsRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
          <p className="text-gray-600 mb-12">
            Quatre étapes, de l'inscription au retrait de votre document
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Créez votre compte', text: 'Inscrivez-vous avec votre email : un code de vérification vous est envoyé.' },
              { title: 'Complétez votre dossier', text: "Renseignez vos informations et vos pièces. L'ambassade valide votre profil." },
              { title: 'Faites vos démarches', text: 'Déposez vos demandes et prenez rendez-vous depuis votre espace.' },
              { title: 'Suivez et retirez', text: "Suivez l'avancement, puis passez à l'ambassade pour finaliser." },
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-green-600 text-white text-2xl font-bold flex items-center justify-center mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs Section */}
      <section ref={valuesRef} className="py-20 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600">
        <div className="max-w-6xl mx-auto px-6 text-white text-center">
          <h2 className="text-4xl font-bold mb-8">Nos valeurs fondamentales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Solidarité', text: 'Une communauté qui se soutient, où chaque Malien du Maroc trouve sa place.', color: 'bg-green-700' },
              { title: 'Excellence', text: 'Des démarches claires, suivies et traitées avec rigueur par les agents de l\'ambassade.', color: 'bg-yellow-500' },
              { title: 'Proximité', text: "L'ambassade à portée de clic, et des agents disponibles pour vous guider.", color: 'bg-red-600' },
            ].map((value, idx) => (
              <div key={idx} className="p-6 rounded-lg shadow-md bg-white/10 backdrop-blur-md">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white ${value.color}`}>
                  {value.title[0]}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-white/90">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section ref={ctaRef} className="py-20 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Rejoignez Poramma</h2>
          <p className="text-gray-300 mb-8">
            Simplifiez dès aujourd'hui vos démarches auprès de l'ambassade du Mali au Maroc.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button onClick={() => setCurrentPage('dashboard')}>
                Accéder à mon espace
              </Button>
            ) : (
              <>
                <Button onClick={() => setCurrentPage('signup')} >
                  Créer mon compte
                </Button>
                <Button onClick={() => setCurrentPage('signin')} variant="outline">
                  J'ai déjà un compte
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              {/* Le logo a un fond blanc : on le pose sur une pastille blanche pour rester lisible sur le pied de page sombre. */}
              <div className="inline-block bg-white rounded-lg px-3 py-1 mb-4">
                <img src={LOGO_SRC} alt="Poramma" className="h-12 w-auto" />
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme officielle des services consulaires du Mali au Maroc.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection(featuresRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Fonctionnalités</button></li>
                <li><button onClick={() => scrollToSection(stepsRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Comment ça marche</button></li>
                <li><button onClick={() => scrollToSection(valuesRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Valeurs</button></li>
                <li><button onClick={() => scrollToSection(ctaRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                {FOOTER_SERVICES.map((label) => (
                  <li key={label}>
                    <button type="button" onClick={openServices} className="text-gray-400 hover:text-white">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{EMBASSY_CONTACT.name}</li>
                <li>{EMBASSY_CONTACT.email}</li>
                <li>{EMBASSY_CONTACT.phone}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
            <div className="mb-3 flex flex-wrap justify-center gap-x-6 gap-y-1">
              <Link to="/conditions-utilisation" className="text-gray-400 hover:text-white">Conditions d'utilisation</Link>
              <Link to="/politique-confidentialite" className="text-gray-400 hover:text-white">Politique de confidentialité</Link>
              <Link to="/signin" state={{ from: '/support' }} className="text-gray-400 hover:text-white">Support</Link>
            </div>
            © {new Date().getFullYear()} Poramma — Ambassade du Mali au Maroc. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
