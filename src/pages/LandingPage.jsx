import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Zap,
  Headset,
  Clock,
  CheckCircle2,
  ChevronRight,
  MapPin,
  PhoneCall,
  MessageCircle,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService, WHATSAPP_NUMBER } from '../services/api';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

/* COMPONENT: Header */
const Header = ({ content }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header glass-panel">
      <div className="container header-content">
        <a href="/" className="logo">
          <img src={content?.logo || "/logo-idatel.png"} alt="Idatel Teleco" className="logo-image" />
        </a>

        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#planes" onClick={() => setIsMenuOpen(false)}>Planes</a>
          <a href="#cobertura" onClick={() => setIsMenuOpen(false)}>Cobertura</a>
          <a href="#beneficios" onClick={() => setIsMenuOpen(false)}>Beneficios</a>
          <Link to="/nosotros" onClick={() => setIsMenuOpen(false)}>Nosotros</Link>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" onClick={() => setIsMenuOpen(false)}>Contacto</a>
          <Link to="/login" className="mobile-only-link" onClick={() => setIsMenuOpen(false)}>Panel Admin</Link>
        </nav>

        <div className="header-actions">
          <a href="#planes" className="btn btn-primary btn-sm hidden-mobile">{content?.heroBtnPrimary || "Contrata Ahora"}</a>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
};

/* COMPONENT: Hero */
const Hero = ({ content }) => {
  return (
    <section className="hero">
      <img src={content?.heroImg || "/hero-fiber.png"} alt="Fiber Background" className="hero-bg-image" />
      <div className="hero-overlay"></div>

      <div className="container hero-container">
        <div className="hero-content">
          <div className="badge">{content?.heroBadge || '🚀 Fibra Óptica Real'}</div>
          <h1 className="hero-title">
            {content?.heroTitle || 'Navega sin límites con'} <span className="text-gradient">Idatel</span>
          </h1>
          <p className="hero-subtitle">
            {content?.heroSubtitle || 'El internet de fibra óptica que tu hogar y empresa merecen. Velocidad simétrica, instalación en 24h y soporte local experto.'}
          </p>
          <div className="hero-buttons">
            <a href="#cobertura" className="btn btn-primary">
              {content?.heroBtnPrimary || 'Verificar Cobertura'}
            </a>
            <a href="#planes" className="btn btn-secondary">
              {content?.heroBtnSecondary || 'Ver Planes'}
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-success" /> Sin letra pequeña
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-success" /> Soporte 24/7
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-success" /> 99.9% Estabilidad
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-abstract-art">
            <div
              className="glass-card floating-card"
              onClick={() => window.open('https://fast.com/es', '_blank')}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 1.5rem',
                gap: '8px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              title="Medir velocidad en Fast.com"
            >
              <p style={{ color: '#B3B3B3', fontSize: '0.85rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
                Test de Velocidad
              </p>
              <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
                <path d="M 10 60 A 40 40 0 0 1 90 60" stroke="#E50914" strokeWidth="14" strokeLinecap="butt" />
                <path d="M 30 60 A 20 20 0 0 1 70 60" stroke="#E50914" strokeWidth="14" strokeLinecap="butt" />
                <path d="M 50 60 L 48 10 L 50 0 L 52 10 Z" fill="#FFFFFF" />
                <circle cx="50" cy="60" r="8" fill="#FFFFFF" />
              </svg>
              <span style={{ fontSize: '3rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-2px', lineHeight: '1', marginTop: '10px' }}>FAST</span>
              <p style={{ color: 'var(--color-primary-light)', fontSize: '0.8rem', marginTop: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Haz clic aquí ▶
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* COMPONENT: Features */
const Features = ({ content }) => {
  const features = [
    {
      icon: <Zap size={32} />,
      title: "Velocidad Simétrica",
      desc: "Sube y descarga archivos a la misma velocidad. Ideal para streaming y gaming sin lag."
    },
    {
      icon: <Wifi size={32} />,
      title: "Estabilidad Extrema",
      desc: "Nuestra red de fibra óptica es 100% dedicada y te garantiza un uptime del 99.9%."
    },
    {
      icon: <Clock size={32} />,
      title: "Instalación en 24h",
      desc: "No esperes semanas. Contratas hoy y mañana ya estás volando por la red."
    },
    {
      icon: <Headset size={32} />,
      title: "Soporte Cerca de Ti",
      desc: "Olvídate de los robots. Hablarás con técnicos locales listos para resolver todo al instante."
    }
  ];

  return (
    <section id="beneficios" className="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{content?.featuresTitle || '¿Por qué elegir'} <span className="text-gradient">Idatel</span>?</h2>
          <p className="section-subtitle">{content?.featuresSubtitle || 'Hemos construido nuestra red pensando en tus necesidades reales.'}</p>
        </div>
        <div className="features-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feat.icon}</div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* COMPONENT: TechSection */
const TechSection = ({ content }) => {
  return (
    <section className="feature-image-section">
      <div className="container">
        <div className="split-grid">
          <div className="split-image-wrapper">
            <img src={content?.techImg || "/tech-bg.png"} alt="Fiber Technology" className="split-image" />
          </div>
          <div className="split-content">
            <div className="badge">{content?.techBadge || '🛠️ Tecnología de Punta'}</div>
            <h2>{content?.techTitle || 'Infraestructura que no se detiene'}</h2>
            <p>
              {content?.techDesc || 'En Idatel utilizamos componentes de última generación y tendidos propios de fibra óptica. Nuestros técnicos están capacitados para reaccionar ante cualquier imprevisto, asegurando que tu hogar siempre esté conectado a la máxima velocidad.'}
            </p>
            <ul className="plan-features">
              <li><CheckCircle2 size={18} className="text-success" /> Red FTTH 100% Pura</li>
              <li><CheckCircle2 size={18} className="text-success" /> Equipos de baja latencia</li>
              <li><CheckCircle2 size={18} className="text-success" /> Mantenimiento proactivo</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

/* COMPONENT: FamilySection */
const FamilySection = ({ content }) => {
  return (
    <section className="feature-image-section bg-surface">
      <div className="container">
        <div className="split-grid" style={{ direction: 'rtl' }}>
          <div className="split-image-wrapper" style={{ direction: 'ltr' }}>
            <img src={content?.familyImg || "/family-bg.png"} alt="Happy Connectivity" className="split-image" />
          </div>
          <div className="split-content" style={{ direction: 'ltr' }}>
            <div className="badge">{content?.familyBadge || '🏠 Conexión Familiar'}</div>
            <h2>{content?.familyTitle || 'Entretenimiento sin interrupciones'}</h2>
            <p>
              {content?.familyDesc || 'Toda la familia al mismo tiempo: streaming 4K, teletrabajo, clases virtuales y gaming. Con Idatel, el ancho de banda nunca es un problema. Conectamos lo que más quieres con el mundo.'}
            </p>
            <a href="#planes" className="btn btn-primary">{content?.familyBtn || 'Ver Planes Disponibles'}</a>
          </div>
        </div>
      </div>
    </section>
  );
};

/* COMPONENT: Pricing */
const Pricing = ({ dynamicPlans, content }) => {
  const [type, setType] = useState('soloInternet');

  const defaultPlans = {
    soloInternet: [
      { speed: "30", name: "Plan Ahorro", price: "50.000", popular: false, features: ["Fibra Óptica Real", "Instalación: $50.000"] },
      { speed: "35", name: "Plan Ahorro", price: "55.000", popular: false, features: ["Fibra Óptica Real", "Instalación: $50.000"] },
      { speed: "40", name: "Plan Médium", price: "60.000", popular: false, features: ["Fibra Óptica Real", "Instalación: $50.000"] },
      { speed: "45", name: "Plan Médium", price: "69.000", popular: false, features: ["Fibra Óptica Real", "Instalación: $50.000"] },
      { speed: "50", name: "Plan Médium", price: "70.000", popular: true, features: ["Fibra Óptica Real", "Instalación: $50.000", "Soporte Prioritario"] },
      { speed: "55", name: "Plan Médium", price: "72.000", popular: false, features: ["Fibra Óptica Real", "Instalación: $50.000", "Soporte Prioritario"] },
      { speed: "80", name: "Plan Premium", price: "80.000", popular: false, features: ["Fibra Óptica Real", "Instalación: $50.000", "Soporte 24/7"] }
    ],
    internetTV: [
      { speed: "30", name: "Plan Ahorro TV", price: "70.000", popular: false, features: ["58 Canales", "Fibra Óptica"] },
      { speed: "30", name: "Plan Medium TV", price: "87.000", popular: false, features: ["78 Canales", "Fibra Óptica"] },
      { speed: "40", name: "Plan Ahorro TV", price: "87.000", popular: false, features: ["58 Canales", "Fibra Óptica"] },
      { speed: "40", name: "Plan Medium TV", price: "92.000", popular: false, features: ["78 Canales", "Fibra Óptica"] },
      { speed: "60", name: "Plan Ahorro TV", price: "96.000", popular: false, features: ["58 Canales", "Fibra Óptica"] },
      { speed: "60", name: "Plan Medium TV", price: "102.000", popular: true, features: ["78 Canales", "Alta Definición"] },
      { speed: "100", name: "Plan Ahorro TV", price: "105.000", popular: false, features: ["58 Canales", "Fibra Óptica"] },
      { speed: "100", name: "Plan Medium TV", price: "111.000", popular: false, features: ["78 Canales", "Soporte 24/7"] }
    ]
  };

  const currentPlans = dynamicPlans && dynamicPlans.length > 0
    ? {
      soloInternet: dynamicPlans.filter(p => p.type === 'soloInternet'),
      internetTV: dynamicPlans.filter(p => p.type === 'internetTV')
    }
    : defaultPlans;

  const handleHirePlan = (plan) => {
    const category = type === 'soloInternet' ? 'Solo Internet' : 'Internet + TV';
    const waMessage = `¡Hola Idatel! Quisiera contratar el ${plan.name} (${category}) de ${plan.speed} Megas, listado en su pagina web por $${plan.price}. ¿Me podrían ayudar?`;
    const url = apiService.generateWhatsAppLink(waMessage);
    window.open(url, '_blank');
  };

  return (
    <section id="planes" className="pricing bg-surface">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{content?.pricingTitle || 'Planes diseñados para ti'}</h2>
          <p className="section-subtitle">{content?.pricingSubtitle || 'Instalación del servicio ($50.000) Fibra. Elige el que mejor se adapte a ti.'}</p>

          <div className="toggle-container">
            <button className={`toggle-btn ${type === 'soloInternet' ? 'active' : ''}`} onClick={() => setType('soloInternet')}>Solo Internet</button>
            <button className={`toggle-btn ${type === 'internetTV' ? 'active' : ''}`} onClick={() => setType('internetTV')}>Internet + TV</button>
          </div>
        </div>

        <div className="pricing-grid">
          {currentPlans[type].map((plan, idx) => (
            <div key={idx} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">El más elegido</div>}
              <div className="pricing-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-speed"><span className="speed-number">{plan.speed}</span><span className="speed-unit">MEGAS</span></div>
                <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/mes</span>
                </div>
              </div>
              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}><CheckCircle2 size={18} className="text-success" /> {f}</li>
                ))}
              </ul>
              <div className="pricing-footer">
                <button
                  onClick={() => handleHirePlan(plan)}
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} block`}
                >
                  Lo Quiero
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* COMPONENT: Coverage */
const Coverage = ({ content }) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await apiService.checkCoverage(address);
      setResult(response);
    } catch (err) {
      setResult(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cobertura" className="coverage">
      <div className="container coverage-container">
        <div className="coverage-content">
          <h2 className="section-title text-base">{content?.coverageTitle || '¿Llegamos a tu barrio?'}</h2>
          <p className="section-subtitle text-base" style={{ opacity: 0.9, marginBottom: '2rem' }}>
            {content?.coverageSubtitle || 'Verifica al instante si nuestra red de fibra óptica ya ilumina tu calle.'}
          </p>

          <form className="coverage-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <MapPin className="input-icon" />
              <input
                type="text"
                placeholder="Ingresa tu municipio (Ej: Socorro)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: 'white', color: 'var(--color-primary)', display: 'flex' }}
              disabled={loading}
            >
              {loading ? <><Loader2 className="spin-icon" size={18} /> Buscando...</> : 'Verificar'}
            </button>
          </form>

          {/* Resultado API */}
          {result && (
            <div className={`coverage-result ${result.status}`} style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: result.status === 'success' ? '#10B981' : (result.status === 'warning' ? '#F59E0B' : '#EF4444'),
              borderRadius: '12px',
              fontWeight: '500',
              animation: 'fillUp 0.3s ease-out'
            }}>
              {result.status === 'success' ? '✅ ' : (result.status === 'error' ? '❌ ' : '⚠️ ')}
              {result.message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* COMPONENT: Footer */
const Footer = ({ content }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">
              <img src={content?.logo || "/logo-idatel.png"} alt="Idatel Teleco" className="logo-image" />
            </a>
            <p className="footer-desc">
              {content?.footerDesc || 'Conectando el futuro a través de redes de fibra óptica de última generación.'}
            </p>
          </div>
          <div className="footer-links">
            <h4>Servicios</h4>
            <a href="#planes">Planes Hogar</a>
            <a href="#planes">Internet Empresas</a>
            <a href="#cobertura">Mapa de Cobertura</a>
          </div>
          <div className="footer-links">
            <h4>Compañía</h4>
            <Link to="/nosotros" style={{ display: 'block', marginBottom: '8px' }}>Nosotros</Link>
            <a href="#">Centro de Ayuda</a>
            <Link to="/login" style={{ color: '#888', fontSize: '13px', marginTop: '10px', display: 'inline-block' }}>Acceso Panel</Link>
            <a href="#">Términos y Condiciones</a>
          </div>
          <div className="footer-contact">
            <h4>Contáctanos</h4>
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="contact-link"><PhoneCall size={18} /> +57 (314) 431-0460</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="contact-link"><MessageCircle size={18} /> WhatsApp Soporte</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Idatel SAS. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="whatsapp-floating" aria-label="Chat on WhatsApp">
        <MessageCircle size={28} color="white" />
      </a>
    </footer>
  );
};

const LandingPage = () => {
  const [plans, setPlans] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansQuery = await getDocs(collection(db, 'plans'));
        const plansData = plansQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlans(plansData);

        const contentDoc = await getDoc(doc(db, 'content', 'home'));
        if (contentDoc.exists()) {
          setSiteContent(contentDoc.data());
        }
      } catch (error) {
        console.error("Error fetching dynamic content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app">
      <Header content={siteContent} />
      <main>
        <Hero content={siteContent} />
        <Features content={siteContent} />
        <TechSection content={siteContent} />
        <Pricing dynamicPlans={plans} content={siteContent} />
        <FamilySection content={siteContent} />
        <Coverage content={siteContent} />
      </main>
      <Footer content={siteContent} />
    </div>
  );
};

export default LandingPage;
