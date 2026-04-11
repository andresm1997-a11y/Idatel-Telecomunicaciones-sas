import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  Building2, 
  Target, 
  Eye, 
  ExternalLink, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const [companyData, setCompanyData] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Company Stats
        const companyDoc = await getDoc(doc(db, 'empresa', 'datos'));
        if (companyDoc.exists()) {
          setCompanyData(companyDoc.data());
        }

        // Team
        const teamQuery = await getDocs(collection(db, 'equipo'));
        setTeam(teamQuery.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching about us data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="about-loading">
        <Loader2 className="spin-icon" size={40} />
        <p>Cargando nuestra historia...</p>
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* Navigation Bar (Mini) */}
      <header className="about-header glass-panel">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} /> Volver al Inicio
          </Link>
          <img src="/logo-idatel.png" alt="Idatel Logo" className="about-logo" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="badge">🏢 Sobre Nosotros</div>
          <h1>Conectando el Futuro de <span className="text-primary">Idatel</span></h1>
          <p className="hero-desc">
            Somos más que un proveedor de internet; somos el puente tecnológico que impulsa el crecimiento de nuestra región.
          </p>
        </div>
      </section>

      {/* History Section */}
      <section className="about-history">
        <div className="container">
          <div className="history-grid">
            <div className="history-image">
              <img src="/tech-bg.png" alt="Our Technology" />
              <div className="experience-badge">
                <span className="years">10+</span>
                <span className="text">Años de Exp.</span>
              </div>
            </div>
            <div className="history-content">
              <h2>Nuestra Historia</h2>
              <p>{companyData?.historia || "Idatel nació con la visión de llevar conectividad de alta calidad a cada rincón, superando las barreras tecnológicas y geográficas."}</p>
              <ul className="stats-list">
                <li><CheckCircle2 className="text-primary" /> Red 100% Fibra Óptica</li>
                <li><CheckCircle2 className="text-primary" /> Cobertura Regional</li>
                <li><CheckCircle2 className="text-primary" /> Soporte Local 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon"><Target size={32} /></div>
              <h3>Misión</h3>
              <p>{companyData?.mision || "Nuestra misión es proveer soluciones de conectividad de vanguardia que transformen la vida de nuestros usuarios."}</p>
            </div>
            <div className="mv-card">
              <div className="mv-icon"><Eye size={32} /></div>
              <h3>Visión</h3>
              <p>{companyData?.vision || "Ser el operador de telecomunicaciones líder en innovación y satisfacción al cliente en todo el territorio nacional."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>El Equipo Detrás del Éxito</h2>
            <p>Conoce al talento humano que hace posible tu conexión día a día.</p>
          </div>
          
          <div className="org-structure">
            {Object.keys(companyData?.niveles || { 1: 'Directivos', 2: 'Coordinadores', 3: 'Operativos' })
              .sort((a,b) => a-b)
              .map(nivelKey => {
                const membersInLevel = team.filter(m => (m.nivel || 3) === Number(nivelKey));
                if (membersInLevel.length === 0) return null;

                return (
                  <div key={nivelKey} className={`team-level-row level-${nivelKey}`}>
                    <h3 className="level-title">
                      <span className="line"></span>
                      {companyData?.niveles?.[nivelKey] || companyData?.niveles?.[Number(nivelKey)] || `Nivel ${nivelKey}`}
                      <span className="line"></span>
                    </h3>
                    <div className="team-grid">
                      {membersInLevel.map(member => (
                        <div key={member.id} className="team-card">
                          <div className="member-photo">
                            <img src={member.fotoUrl} alt={member.nombre} />
                          </div>
                          <div className="member-info">
                            <h4>{member.nombre}</h4>
                            <p>{member.cargo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            
            {team.length === 0 && (
              <p className="no-data">No hay integrantes configurados actualmente.</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer (Simplified) */}
      <footer className="about-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Idatel SAS. Tecnología que nos une.</p>
        </div>
      </footer>

      <style>{`
        .about-page {
          background: #000;
          color: white;
          min-height: 100vh;
        }

        .about-header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 1rem 0;
        }

        .about-header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #b3b3b3;
          font-weight: 600;
          transition: 0.3s;
        }

        .back-link:hover { color: white; }

        .about-logo { height: 40px; }

        .about-hero {
          padding: 8rem 0 4rem;
          text-align: center;
          background: radial-gradient(circle at center, rgba(229, 9, 20, 0.1) 0%, transparent 70%);
        }

        .about-hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 1rem 0;
        }

        .hero-desc {
          max-width: 700px;
          margin: 0 auto;
          color: #b3b3b3;
          font-size: 1.2rem;
        }

        .about-history { padding: 6rem 0; }
        .history-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 4rem;
          align-items: center;
        }

        .history-image {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
        }

        .history-image img {
          width: 100%;
          display: block;
        }

        .experience-badge {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          background: var(--color-primary);
          padding: 1.5rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .experience-badge .years {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }

        .experience-badge .text { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }

        .history-content h2 { font-size: 2.5rem; margin-bottom: 2rem; }
        .history-content p { color: #b3b3b3; line-height: 1.8; margin-bottom: 2rem; }

        .stats-list {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stats-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
        }

        .mission-vision { padding: 4rem 0; }
        .mv-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .mv-card {
          background: #111;
          padding: 3rem;
          border-radius: 24px;
          border: 1px solid #222;
          transition: 0.3s;
        }

        .mv-card:hover { border-color: var(--color-primary); transform: translateY(-5px); }
        .mv-icon { color: var(--color-primary); margin-bottom: 1.5rem; }
        .mv-card h3 { font-size: 1.8rem; margin-bottom: 1rem; }
        .mv-card p { color: #b3b3b3; line-height: 1.6; }

        .team-section { padding: 6rem 0; }
        .section-header { text-align: center; margin-bottom: 5rem; }
        .section-header h2 { font-size: 2.5rem; margin-bottom: 1rem; }
        .section-header p { color: #b3b3b3; }

        .org-structure {
          display: flex;
          flex-direction: column;
          gap: 5rem;
        }

        .level-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
          color: white;
          font-size: 1.5rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .level-title .line {
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
          flex: 1;
          max-width: 150px;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 190px));
          gap: 1.5rem;
          justify-content: center;
        }

        .team-card {
          background: #111;
          border-radius: 16px;
          overflow: hidden;
          text-align: center;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #222;
          width: 100%;
        }

        .level-1 .team-card {
           border-color: rgba(229, 9, 20, 0.4);
        }

        .member-photo {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .member-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.5s;
        }

        .team-card:hover { border-color: var(--color-primary); transform: translateY(-5px); }
        .team-card:hover .member-photo img { transform: scale(1.05); }

        .member-info { padding: 1.25rem; }
        .member-info h4 { font-size: 1rem; margin-bottom: 0.25rem; font-weight: 800; }
        .member-info p { color: var(--color-primary); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .about-loading {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #b3b3b3;
          gap: 1rem;
        }

        .about-footer {
          padding: 4rem 0;
          text-align: center;
          border-top: 1px solid #111;
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 992px) {
          .history-grid, .mv-grid { grid-template-columns: 1fr; }
          .about-hero h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
