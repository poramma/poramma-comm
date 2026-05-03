import React, { RefObject, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users, FileText, CheckCircle, Star, Menu, X } from 'lucide-react';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const setCurrentPage = (page: string) => {
    navigate(`/${page}`);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo placeholder - Replace with your actual logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                MA
              </div>
              <span className="text-xl font-bold text-gray-900">MaliServices</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection(featuresRef as RefObject<HTMLDivElement>)} 
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Fonctionnalités
              </button>
              <button 
                onClick={() => scrollToSection(statsRef as RefObject<HTMLDivElement>)} 
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Notre communauté
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
              <div className="flex space-x-4">
                <Button onClick={() => setCurrentPage('signin')} variant="outline" size="sm">
                  Connexion
                </Button>
                <Button onClick={() => setCurrentPage('signup')} size="sm" endIcon={<ArrowRight size={16} />}>
                  S'inscrire
                </Button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-green-600"
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
                onClick={() => scrollToSection(statsRef as RefObject<HTMLDivElement>)} 
                className="block w-full text-left py-2 text-gray-700 hover:text-green-600"
              >
                Notre communauté
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
              Bienvenue sur la plateforme officielle
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Services consulaires simplifiés
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Accédez facilement aux services consulaires en ligne : demande de passeport, carte d'identité, actes d'état civil, et bien plus encore.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => setCurrentPage('signup')} endIcon={<ArrowRight />}>
              Rejoindre la plateforme
            </Button>
            <Button onClick={() => setCurrentPage('signin')} variant="outline">
              Se connecter
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-2">Fonctionnalités clés</h2>
            <p className="text-gray-600 text-lg">
              Tous les outils dont vous avez besoin pour simplifier votre vie administrative
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Demandes en ligne',
                description: 'Passeport, visa, actes d\'état civil... en quelques clics.',
                color: 'success',
              },
              {
                icon: Clock,
                title: 'Suivi en temps réel',
                description: 'Soyez informé à chaque étape de vos démarches.',
                color: 'warning',
              },
              {
                icon: Shield,
                title: 'Sécurité maximale',
                description: 'Vos données sont protégées avec un chiffrement bancaire.',
                color: 'error',
              },
              {
                icon: Users,
                title: 'Support humain',
                description: 'Nos agents sont là pour vous guider à tout moment.',
                color: 'info',
              },
              {
                icon: CheckCircle,
                title: 'Processus clair',
                description: 'Une expérience utilisateur pensée pour vous.',
                color: 'primary',
              },
              {
                icon: Star,
                title: 'Service premium',
                description: 'Des délais optimisés et un accompagnement personnalisé.',
                color: 'dark',
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <Badge color={feature.color} variant="light" startIcon={<feature.icon className="h-5 w-5" />}>
                  {feature.title}
                </Badge>
                <p className="mt-4 text-gray-700 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section ref={statsRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Des milliers de Maliens nous font confiance</h2>
          <p className="text-gray-600 mb-12">
            Notre communauté s'agrandit chaque jour
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '15 000+', label: 'Utilisateurs actifs' },
              { number: '45 000+', label: 'Demandes traitées' },
              { number: '98%', label: 'Satisfaction' },
              { number: '12j', label: 'Délai moyen' },
            ].map((item, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-green-600">{item.number}</div>
                <div className="text-gray-600">{item.label}</div>
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
              { title: 'Solidarité', color: 'bg-green-700' },
              { title: 'Excellence', color: 'bg-yellow-500' },
              { title: 'Proximité', color: 'bg-red-600' },
            ].map((value, idx) => (
              <div key={idx} className="p-6 rounded-lg shadow-md bg-white/10 backdrop-blur-md">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white ${value.color}`}>
                  {value.title[0]}
                </div>
                <h3 className="text-xl font-semibold">{value.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section ref={ctaRef} className="py-20 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Rejoignez la communauté</h2>
          <p className="text-gray-300 mb-8">
            Simplifiez dès aujourd'hui vos démarches auprès de l'ambassade du Mali.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setCurrentPage('signup')} >
              Créer mon compte
            </Button>
            <Button onClick={() => setCurrentPage('signin')} variant="outline">
              J'ai déjà un compte
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  MA
                </div>
                <span className="text-xl font-bold">MaliServices</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme officielle des services consulaires du Mali au Maroc.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection(featuresRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Fonctionnalités</button></li>
                <li><button onClick={() => scrollToSection(statsRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Communauté</button></li>
                <li><button onClick={() => scrollToSection(valuesRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Valeurs</button></li>
                <li><button onClick={() => scrollToSection(ctaRef as RefObject<HTMLDivElement>)} className="text-gray-400 hover:text-white">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-white">Passeport</button></li>
                <li><button className="text-gray-400 hover:text-white">Carte consulaire</button></li>
                <li><button className="text-gray-400 hover:text-white">Actes d'état civil</button></li>
                <li><button className="text-gray-400 hover:text-white">Visa</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Ambassade du Mali au Maroc</li>
                <li>contact@maliservices.ma</li>
                <li>+212 5 22 00 00 00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MaliServices - Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;