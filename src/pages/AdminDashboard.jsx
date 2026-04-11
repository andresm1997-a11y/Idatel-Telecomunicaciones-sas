import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Trash2,
  Edit,
  Edit3,
  Save,
  LogOut,
  LayoutDashboard,
  Wifi,
  Type,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  Users,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  Search,
  Menu,
  X,
  UserCog,
  Lock,
  Mail
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [siteContent, setSiteContent] = useState({
    // Global
    logo: '/logo-idatel.png',
    footerDesc: 'Conectando el futuro a través de redes de fibra óptica de última generación.',

    // Hero
    heroBadge: '🚀 Fibra Óptica Real',
    heroTitle: 'Navega sin límites con',
    heroSubtitle: 'El internet de fibra óptica que tu hogar y empresa merecen. Velocidad simétrica, instalación en 24h y soporte local experto.',
    heroBtnPrimary: 'Verificar Cobertura',
    heroBtnSecondary: 'Ver Planes',
    heroImg: '/hero-fiber.png',

    // Tech Section
    techBadge: '🛠️ Tecnología de Punta',
    techTitle: 'Infraestructura que no se detiene',
    techDesc: 'En Idatel utilizamos componentes de última generación y tendidos propios de fibra óptica. Nuestros técnicos están capacitados para reaccionar ante cualquier imprevisto, asegurando que tu hogar siempre esté conectado a la máxima velocidad.',
    techImg: '/tech-bg.png',

    // Family Section
    familyBadge: '🏠 Conexión Familiar',
    familyTitle: 'Entretenimiento sin interrupciones',
    familyDesc: 'Toda la familia al mismo tiempo: streaming 4K, teletrabajo, clases virtuales y gaming. Con Idatel, el ancho de banda nunca es un problema. Conectamos lo que más quieres con el mundo.',
    familyBtn: 'Ver Planes Disponibles',
    familyImg: '/family-bg.png',

    // About Us
    aboutBadge: '🏢 Sobre Nosotros',
    aboutHeroTitle: 'Conectando el Futuro de Idatel',
    aboutHeroDesc: 'Somos más que un proveedor de internet; somos el puente tecnológico que impulsa el crecimiento de nuestra región.',
    historyTitle: 'Nuestra Historia',
    historyImg: '/tech-bg.png'
  });
  const [activeSiteTab, setActiveSiteTab] = useState('inicio');
  const [accessConfig, setAccessConfig] = useState({
    loginMethod: 'email',
    adminAlias: ''
  });
  const [companyData, setCompanyData] = useState({
    historia: '',
    mision: '',
    vision: '',
    niveles: {
      1: 'Directivos',
      2: 'Coordinadores',
      3: 'Operativos'
    }
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamForm, setTeamForm] = useState({
    nombre: '',
    cargo: '',
    linkedin: '',
    fotoUrl: '',
    nivel: 2
  });
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [planSearch, setPlanSearch] = useState('');
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile states
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    newEmail: '',
    currentPasswordForEmail: '',
    currentPasswordForPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState({
    name: false,
    email: false,
    password: false
  });

  // Filter plans based on search term
  const filteredPlans = plans.filter(plan => {
    const term = planSearch.toLowerCase();
    return (
      plan.name.toLowerCase().includes(term) ||
      plan.price.toString().includes(term) ||
      plan.speed.toString().includes(term)
    );
  });

  // Form states for adding/editing plans
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    speed: '',
    type: 'soloInternet',
    popular: false,
    features: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    console.log("Iniciando carga de datos desde Firestore...");
    try {
      // Fetch Plans
      const plansQuery = await getDocs(collection(db, 'plans'));
      const plansData = plansQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(plansData);
      console.log("Planes cargados:", plansData.length);

      const contentDoc = await getDoc(doc(db, 'content', 'home'));
      if (contentDoc.exists()) {
        setSiteContent(prev => ({ ...prev, ...contentDoc.data() }));
        console.log("Contenido del sitio cargado.");
      }

      // Fetch Access Config
      const accessDoc = await getDoc(doc(db, 'config_acceso', 'settings'));
      if (accessDoc.exists()) {
        setAccessConfig(accessDoc.data());
        console.log("Configuración de acceso cargada.");
      }

      // Fetch Company Data
      const companyDoc = await getDoc(doc(db, 'empresa', 'datos'));
      if (companyDoc.exists()) {
        const data = companyDoc.data();
        // Asegurar que existan los niveles por defecto si no están en la DB
        if (!data.niveles) {
          data.niveles = { 1: 'Directivos', 2: 'Coordinadores', 3: 'Operativos' };
        }
        setCompanyData(data);
        console.log("Datos de empresa cargados.");
      }

      // Fetch Team Members
      const teamQuery = await getDocs(collection(db, 'equipo'));
      const teamData = teamQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(teamData);
      console.log("Miembros del equipo cargados:", teamData.length);
    } catch (error) {
      console.error("Error detallado de Firestore:", error);
      let errorMsg = 'Error al cargar los datos.';
      if (error.code === 'permission-denied') {
        errorMsg = 'Permiso denegado. Revisa las "Reglas" de tu Firestore en la consola de Firebase.';
      }
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const startEditTeamMember = (member) => {
    setEditingTeamMember(member);
    setTeamForm({
      nombre: member.nombre,
      cargo: member.cargo,
      linkedin: member.linkedin || '',
      fotoUrl: member.fotoUrl,
      nivel: member.nivel || 3
    });
    setFileToUpload(null);
    if (window.innerWidth < 1100) setIsSidebarOpen(false);

    // Smooth scroll to team form
    const formElement = document.getElementById('team-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  // --- PLANS LOGIC ---
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const planData = {
      ...planForm,
      features: planForm.features.split(',').map(f => f.trim()),
      popular: planForm.popular === 'true' || planForm.popular === true
    };

    try {
      if (editingPlan) {
        await updateDoc(doc(db, 'plans', editingPlan.id), planData);
        showMessage('success', 'Plan actualizado con éxito.');
      } else {
        await addDoc(collection(db, 'plans'), planData);
        showMessage('success', 'Nuevo plan agregado.');
      }
      setEditingPlan(null);
      setPlanForm({ name: '', price: '', speed: '', type: 'soloInternet', popular: false, features: '' });
      fetchInitialData();
    } catch (error) {
      console.error(error);
      showMessage('error', 'Error al guardar el plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este plan?')) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'plans', id));
      showMessage('success', 'Plan eliminado.');
      fetchInitialData();
    } catch (error) {
      showMessage('error', 'Error al eliminar.');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      ...plan,
      features: plan.features.join(', '),
      popular: plan.popular
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- CONTENT LOGIC ---
  const handleSaveContent = async (e) => {
    if (e) e.preventDefault();
    setActionLoading(true);
    try {
      await setDoc(doc(db, 'content', 'home'), siteContent);
      showMessage('success', 'Contenido e imágenes actualizados con éxito.');
    } catch (error) {
      console.error(error);
      showMessage('error', 'Error al actualizar contenidos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSiteImageUpload = async (field, file) => {
    if (!file) return;
    setActionLoading(true);
    setUploading(true);
    try {
      const fileRef = ref(storage, `site/${field}_${Date.now()}`);
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setSiteContent(prev => ({ ...prev, [field]: url }));
      showMessage('success', 'Imagen subida (Haz clic en Guardar para confirmar).');
    } catch (error) {
      console.error(error);
      showMessage('error', 'Error al subir la imagen.');
    } finally {
      setActionLoading(false);
      setUploading(false);
    }
  };

  const handleSiteImageDelete = async (field) => {
    const currentUrl = siteContent[field];
    if (!currentUrl) return;

    // Verificar si es una imagen por defecto del sistema
    const defaultImages = ['/hero-fiber.png', '/tech-bg.png', '/family-bg.png', '/logo-idatel.png'];
    if (defaultImages.includes(currentUrl)) {
      showMessage('error', 'Esta es una imagen por defecto del sistema. No se puede eliminar.');
      return;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen? Se restaurará la imagen por defecto.')) return;

    setActionLoading(true);
    try {
      // Intentar eliminar de Firebase Storage si es una URL de Storage
      if (currentUrl.includes('firebasestorage.googleapis.com')) {
        const storagePath = decodeURIComponent(currentUrl.split('/o/')[1].split('?')[0]);
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      }

      // Restaurar imagen por defecto según el campo
      const defaultImageMap = {
        heroImg: '/hero-fiber.png',
        techImg: '/tech-bg.png',
        familyImg: '/family-bg.png',
        historyImg: '/tech-bg.png',
        logo: '/logo-idatel.png'
      };

      const defaultImage = defaultImageMap[field] || '/logo-idatel.png';
      setSiteContent(prev => ({ ...prev, [field]: defaultImage }));
      showMessage('success', 'Imagen eliminada. Se ha restaurado la imagen por defecto.');
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      // Incluso si falla la eliminación en Storage, restaurar la imagen por defecto
      const defaultImageMap = {
        heroImg: '/hero-fiber.png',
        techImg: '/tech-bg.png',
        familyImg: '/family-bg.png',
        historyImg: '/tech-bg.png',
        logo: '/logo-idatel.png'
      };
      const defaultImage = defaultImageMap[field] || '/logo-idatel.png';
      setSiteContent(prev => ({ ...prev, [field]: defaultImage }));
      showMessage('success', 'Imagen restaurada a la imagen por defecto (Error al eliminar de Storage).');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAccessConfig = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await setDoc(doc(db, 'config_acceso', 'settings'), {
        ...accessConfig,
        updatedAt: new Date().toISOString()
      });
      showMessage('success', 'Ajustes de acceso guardados con éxito.');
    } catch (error) {
      console.error(error);
      showMessage('error', 'Error al guardar configuración.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await setDoc(doc(db, 'empresa', 'datos'), companyData);
      showMessage('success', 'Información de la empresa actualizada.');
    } catch (error) {
      showMessage('error', 'Error al guardar datos de la empresa.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setUploading(true);

    let finalPhotoUrl = teamForm.fotoUrl;

    try {
      // 1. Si hay un archivo seleccionado, subirlo primero
      if (fileToUpload) {
        const fileRef = ref(storage, `equipo/${Date.now()}_${fileToUpload.name}`);
        const snapshot = await uploadBytes(fileRef, fileToUpload);
        finalPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Guardar o actualizar en Firestore
      if (editingTeamMember) {
        await updateDoc(doc(db, 'equipo', editingTeamMember.id), {
          ...teamForm,
          fotoUrl: finalPhotoUrl,
          updatedAt: new Date().toISOString()
        });
        showMessage('success', 'Integrante actualizado con éxito.');
      } else {
        await addDoc(collection(db, 'equipo'), {
          ...teamForm,
          fotoUrl: finalPhotoUrl,
          createdAt: new Date().toISOString()
        });
        showMessage('success', 'Integrante añadido al equipo.');
      }

      setTeamForm({ nombre: '', cargo: '', linkedin: '', fotoUrl: '', nivel: 2 });
      setFileToUpload(null);
      setEditingTeamMember(null);
      fetchInitialData();
    } catch (error) {
      console.error(error);
      let errorDetail = 'Error al procesar el integrante o la imagen.';
      if (error.code === 'storage/unauthorized') {
        errorDetail = 'Error: Revisa las reglas de seguridad de Firebase Storage (Permiso denegado).';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorDetail = 'Error: Tiempo de espera agotado. Revisa tu conexión.';
      } else if (error.code === 'storage/project-not-found') {
        errorDetail = 'Error: El servicio de Storage no parece estar habilitado en este proyecto.';
      }
      showMessage('error', errorDetail);
    } finally {
      setActionLoading(false);
      setUploading(false);
    }
  };

  const deleteTeamMember = async (id) => {
    if (!window.confirm('¿Eliminar de este integrante?')) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'equipo', id));
      showMessage('success', 'Integrante eliminado.');
      fetchInitialData();
    } catch (error) {
      showMessage('error', 'Error al eliminar integrante.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- PROFILE LOGIC ---
  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    if (!profileForm.displayName.trim()) {
      showMessage('error', 'El nombre no puede estar vacío.');
      return;
    }
    setProfileLoading(prev => ({ ...prev, name: true }));
    try {
      await updateUserProfile(profileForm.displayName.trim());
      showMessage('success', 'Nombre actualizado con éxito.');
      setProfileForm(prev => ({ ...prev, displayName: '' }));
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      showMessage('error', 'Error al actualizar el nombre. Intenta nuevamente.');
    } finally {
      setProfileLoading(prev => ({ ...prev, name: false }));
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!profileForm.newEmail.trim() || !profileForm.currentPasswordForEmail) {
      showMessage('error', 'Completa el nuevo correo y tu contraseña actual.');
      return;
    }
    setProfileLoading(prev => ({ ...prev, email: true }));
    try {
      await updateUserEmail(profileForm.currentPasswordForEmail, profileForm.newEmail.trim());
      showMessage('success', 'Correo actualizado con éxito. Debes verificar el nuevo correo.');
      setProfileForm(prev => ({ ...prev, newEmail: '', currentPasswordForEmail: '' }));
    } catch (error) {
      console.error('Error al actualizar correo:', error);
      if (error.code === 'auth/requires-recent-login') {
        showMessage('error', 'Por seguridad, cierra sesión y vuelve a iniciar antes de cambiar tu correo.');
      } else if (error.code === 'auth/wrong-password') {
        showMessage('error', 'La contraseña actual es incorrecta.');
      } else if (error.code === 'auth/email-already-in-use') {
        showMessage('error', 'Este correo ya está en uso por otra cuenta.');
      } else if (error.code === 'auth/invalid-email') {
        showMessage('error', 'El correo ingresado no es válido.');
      } else {
        showMessage('error', 'Error al actualizar el correo. Intenta nuevamente.');
      }
    } finally {
      setProfileLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!profileForm.currentPasswordForPassword || !profileForm.newPassword || !profileForm.confirmPassword) {
      showMessage('error', 'Completa todos los campos de contraseña.');
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      showMessage('error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    if (profileForm.newPassword.length < 6) {
      showMessage('error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setProfileLoading(prev => ({ ...prev, password: true }));
    try {
      await updateUserPassword(profileForm.currentPasswordForPassword, profileForm.newPassword);
      showMessage('success', 'Contraseña actualizada con éxito.');
      setProfileForm(prev => ({ ...prev, currentPasswordForPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      if (error.code === 'auth/requires-recent-login') {
        showMessage('error', 'Por seguridad, cierra sesión y vuelve a iniciar antes de cambiar tu contraseña.');
      } else if (error.code === 'auth/wrong-password') {
        showMessage('error', 'La contraseña actual es incorrecta.');
      } else if (error.code === 'auth/weak-password') {
        showMessage('error', 'La contraseña nueva es muy débil.');
      } else {
        showMessage('error', 'Error al actualizar la contraseña. Intenta nuevamente.');
      }
    } finally {
      setProfileLoading(prev => ({ ...prev, password: false }));
    }
  };



  if (loading) return (
    <div className="admin-loading">
      <Loader2 className="spin-icon" size={40} />
      <p>Cargando Dashboard Administrativo...</p>
    </div>
  );

  return (
    <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Menu Toggle */}
      <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/logo-idatel.png" alt="Idatel Logo" />
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'plans' ? 'active' : ''}
            onClick={() => { setActiveTab('plans'); setIsSidebarOpen(false); }}
          >
            <Wifi size={20} /> Gestión de Planes
          </button>
          <button
            className={activeTab === 'content' ? 'active' : ''}
            onClick={() => { setActiveTab('content'); setIsSidebarOpen(false); }}
          >
            <Edit3 size={20} />
            <span>Imágenes y Texto</span>
          </button>
          <button
            className={activeTab === 'access' ? 'active' : ''}
            onClick={() => { setActiveTab('access'); setIsSidebarOpen(false); }}
          >
            <ShieldCheck size={20} /> Ajustes de Acceso
          </button>
          <button
            className={activeTab === 'empresa' ? 'active' : ''}
            onClick={() => { setActiveTab('empresa'); setIsSidebarOpen(false); }}
          >
            <Building2 size={20} /> Gestión de Empresa
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
          >
            <UserCog size={20} /> Mi Cuenta
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'plans' && 'Gestión de Planes'}
            {activeTab === 'content' && 'Textos del Sitio'}
            {activeTab === 'access' && 'Seguridad y Acceso'}
            {activeTab === 'empresa' && 'Gestión de Empresa y Equipo'}
            {activeTab === 'profile' && 'Mi Cuenta'}
          </h1>
          <a href="/" target="_blank" className="btn btn-outline btn-sm">Ver Sitio Web</a>
        </header>

        {message.text && (
          <div className={`admin-alert ${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="admin-content-grid">
            {/* Plan Form */}
            <div className="admin-card">
              <h3>{editingPlan ? 'Editar Plan' : 'Agregar Nuevo Plan'}</h3>
              <form onSubmit={handleSavePlan} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre del Plan</label>
                    <input
                      type="text"
                      placeholder="Ej: Plan Ahorro"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select value={planForm.type} onChange={(e) => setPlanForm({ ...planForm, type: e.target.value })}>
                      <option value="soloInternet">Solo Internet</option>
                      <option value="internetTV">Internet + TV</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio (Sin puntos ni símbolos)</label>
                    <input
                      type="text"
                      placeholder="Ej: 50.000"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Velocidad (Megas)</label>
                    <input
                      type="text"
                      placeholder="Ej: 30"
                      value={planForm.speed}
                      onChange={(e) => setPlanForm({ ...planForm, speed: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Características (Separadas por comas)</label>
                  <textarea
                    placeholder="Ej: Fibra Óptica, Instalación Gratis, Soporte 24/7"
                    value={planForm.features}
                    onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={planForm.popular}
                      onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    /> ¿Es el plan más elegido (Popular)?
                  </label>
                </div>

                <div className="form-actions">
                  {editingPlan && (
                    <button type="button" className="btn btn-secondary" onClick={() => {
                      setEditingPlan(null);
                      setPlanForm({ name: '', price: '', speed: '', type: 'soloInternet', popular: false, features: '' });
                    }}>Cancelar</button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="spin-icon" /> : <Save size={18} />}
                    {editingPlan ? 'Actualizar Plan' : 'Guardar Plan'}
                  </button>
                </div>
              </form>
            </div>

            {/* Plans List */}
            <div className="admin-card">
              <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Planes Actuales</h3>
                <div className="search-bar" style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, precio o megas..."
                    value={planSearch}
                    onChange={(e) => setPlanSearch(e.target.value)}
                    style={{ paddingLeft: '35px', fontSize: '0.8rem', width: '100%', height: '38px' }}
                  />
                </div>
                {plans.length === 0 && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('¿Quieres cargar los planes predeterminados de Idatel?')) return;
                      setActionLoading(true);
                      const defaultPlans = [
                        { speed: "30", name: "Plan Ahorro", price: "50.000", popular: false, type: 'soloInternet', features: ["Fibra Óptica Real", "Instalación: $50.000"] },
                        { speed: "35", name: "Plan Ahorro", price: "55.000", popular: false, type: 'soloInternet', features: ["Fibra Óptica Real", "Instalación: $50.000"] },
                        { speed: "40", name: "Plan Médium", price: "60.000", popular: false, type: 'soloInternet', features: ["Fibra Óptica Real", "Instalación: $50.000"] },
                        { speed: "45", name: "Plan Médium", price: "69.000", popular: false, type: 'soloInternet', features: ["Fibra Óptica Real", "Instalación: $50.000"] },
                        { speed: "50", name: "Plan Médium", price: "70.000", popular: true, type: 'soloInternet', features: ["Fibra Óptica Real", "Instalación: $50.000", "Soporte Prioritario"] },
                        { speed: "55", name: "Plan Médium", price: "72.000", popular: false, type: 'soloInternet', features: ["Fibra Óptica Real", "Instalación: $50.000", "Soporte Prioritario"] },
                        { speed: "80", name: "Plan Premium", price: "80.000", popular: false, type: 'soloInternet', features: ["Fibra Óptica Real", "Instalación: $50.000", "Soporte 24/7"] },
                        { speed: "30", name: "Plan Ahorro TV", price: "70.000", popular: false, type: 'internetTV', features: ["58 Canales", "Fibra Óptica"] },
                        { speed: "30", name: "Plan Medium TV", price: "87.000", popular: false, type: 'internetTV', features: ["78 Canales", "Fibra Óptica"] },
                        { speed: "40", name: "Plan Ahorro TV", price: "87.000", popular: false, type: 'internetTV', features: ["58 Canales", "Fibra Óptica"] },
                        { speed: "40", name: "Plan Medium TV", price: "92.000", popular: false, type: 'internetTV', features: ["78 Canales", "Fibra Óptica"] },
                        { speed: "60", name: "Plan Ahorro TV", price: "96.000", popular: false, type: 'internetTV', features: ["58 Canales", "Fibra Óptica"] },
                        { speed: "60", name: "Plan Medium TV", price: "102.000", popular: true, type: 'internetTV', features: ["78 Canales", "Alta Definición"] },
                        { speed: "100", name: "Plan Ahorro TV", price: "105.000", popular: false, type: 'internetTV', features: ["58 Canales", "Fibra Óptica"] },
                        { speed: "100", name: "Plan Medium TV", price: "111.000", popular: false, type: 'internetTV', features: ["78 Canales", "Soporte 24/7"] }
                      ];

                      try {
                        for (const plan of defaultPlans) {
                          await addDoc(collection(db, 'plans'), plan);
                        }
                        showMessage('success', 'Planes iniciales cargados con éxito.');
                        fetchInitialData();
                      } catch (err) {
                        showMessage('error', 'Error al cargar planes iniciales.');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.7rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                  >
                    🚀 Cargar Planes Iniciales
                  </button>
                )}
              </div>
              <div className="plans-table-wrapper">
                <table className="plans-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Precio</th>
                      <th>Velocidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.name}</td>
                        <td>${plan.price}</td>
                        <td>{plan.speed}MB</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit" onClick={() => startEditPlan(plan)}><Edit size={16} /></button>
                            <button className="action-btn delete" onClick={() => deletePlan(plan.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPlans.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No se encontraron planes.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'content' && (
          <div className="site-editor">
            <div className="admin-header" style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Imágenes y Texto del Sitio</h2>
              <div className="sub-tabs" style={{ display: 'flex', gap: '0.5rem', background: '#111', padding: '0.5rem', borderRadius: '12px', flexWrap: 'wrap' }}>
                <button className={`btn btn-sm ${activeSiteTab === 'inicio' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSiteTab('inicio')}>🏠 Inicio</button>
                <button className={`btn btn-sm ${activeSiteTab === 'nosotros' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSiteTab('nosotros')}>🏢 Nosotros</button>
                <button className={`btn btn-sm ${activeSiteTab === 'global' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSiteTab('global')}>⚙️ Logo / Global</button>
              </div>
            </div>

            <form onSubmit={handleSaveContent} className="admin-form">
              {activeSiteTab === 'inicio' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>

                  {/* Hero */}
                  <div className="admin-card">
                    <h3>🎯 Sección Hero (Portada)</h3>
                    <div className="form-group">
                      <label>Badge superior</label>
                      <input type="text" value={siteContent.heroBadge} onChange={(e) => setSiteContent({ ...siteContent, heroBadge: e.target.value })} placeholder="🚀 Fibra Óptica Real" />
                    </div>
                    <div className="form-group">
                      <label>Título Principal</label>
                      <input type="text" value={siteContent.heroTitle} onChange={(e) => setSiteContent({ ...siteContent, heroTitle: e.target.value })} placeholder="Navega sin límites con" />
                    </div>
                    <div className="form-group">
                      <label>Subtítulo</label>
                      <textarea rows="3" value={siteContent.heroSubtitle} onChange={(e) => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Botón 1 (CTA)</label>
                        <input type="text" value={siteContent.heroBtnPrimary} onChange={(e) => setSiteContent({ ...siteContent, heroBtnPrimary: e.target.value })} placeholder="Verificar Cobertura" />
                      </div>
                      <div className="form-group">
                        <label>Botón 2 (Secundario)</label>
                        <input type="text" value={siteContent.heroBtnSecondary} onChange={(e) => setSiteContent({ ...siteContent, heroBtnSecondary: e.target.value })} placeholder="Ver Planes" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>📷 Imagen de Fondo (Hero)</label>
                      <div style={{ border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', position: 'relative' }}>
                        <img src={siteContent.heroImg || '/hero-fiber.png'} alt="Preview Hero" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                        {siteContent.heroImg && !['/hero-fiber.png'].includes(siteContent.heroImg) && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#E50914',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSiteImageDelete('heroImg');
                            }}
                            title="Eliminar imagen"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleSiteImageUpload('heroImg', e.target.files[0])} />
                      <small style={{ color: '#666', fontSize: '0.75rem' }}>Si no subes imagen nueva, se mantiene la actual.</small>
                    </div>
                  </div>

                  {/* Tech Section */}
                  <div className="admin-card">
                    <h3>🛠️ Sección Tecnología</h3>
                    <div className="form-group">
                      <label>Badge</label>
                      <input type="text" value={siteContent.techBadge} onChange={(e) => setSiteContent({ ...siteContent, techBadge: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Título</label>
                      <input type="text" value={siteContent.techTitle} onChange={(e) => setSiteContent({ ...siteContent, techTitle: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea rows="4" value={siteContent.techDesc} onChange={(e) => setSiteContent({ ...siteContent, techDesc: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>📷 Imagen Decorativa</label>
                      <div style={{ border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', position: 'relative' }}>
                        <img src={siteContent.techImg || '/tech-bg.png'} alt="Preview Tech" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                        {siteContent.techImg && !['/tech-bg.png'].includes(siteContent.techImg) && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#E50914',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSiteImageDelete('techImg');
                            }}
                            title="Eliminar imagen"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleSiteImageUpload('techImg', e.target.files[0])} />
                    </div>
                  </div>

                  {/* Family Section */}
                  <div className="admin-card">
                    <h3>🏠 Sección Familiar</h3>
                    <div className="form-group">
                      <label>Badge</label>
                      <input type="text" value={siteContent.familyBadge} onChange={(e) => setSiteContent({ ...siteContent, familyBadge: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Título</label>
                      <input type="text" value={siteContent.familyTitle} onChange={(e) => setSiteContent({ ...siteContent, familyTitle: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea rows="4" value={siteContent.familyDesc} onChange={(e) => setSiteContent({ ...siteContent, familyDesc: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Texto del Botón</label>
                      <input type="text" value={siteContent.familyBtn} onChange={(e) => setSiteContent({ ...siteContent, familyBtn: e.target.value })} placeholder="Ver Planes Disponibles" />
                    </div>
                    <div className="form-group">
                      <label>📷 Imagen Familiar</label>
                      <div style={{ border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', position: 'relative' }}>
                        <img src={siteContent.familyImg || '/family-bg.png'} alt="Preview Family" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                        {siteContent.familyImg && !['/family-bg.png'].includes(siteContent.familyImg) && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#E50914',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSiteImageDelete('familyImg');
                            }}
                            title="Eliminar imagen"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleSiteImageUpload('familyImg', e.target.files[0])} />
                    </div>
                  </div>

                </div>
              )}

              {activeSiteTab === 'nosotros' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
                  <div className="admin-card">
                    <h3>🏢 Página Sobre Nosotros</h3>
                    <div className="form-group">
                      <label>Badge de Página</label>
                      <input type="text" value={siteContent.aboutBadge} onChange={(e) => setSiteContent({ ...siteContent, aboutBadge: e.target.value })} placeholder="🏢 Sobre Nosotros" />
                    </div>
                    <div className="form-group">
                      <label>Título de Bienvenida</label>
                      <input type="text" value={siteContent.aboutHeroTitle} onChange={(e) => setSiteContent({ ...siteContent, aboutHeroTitle: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Descripción de Bienvenida</label>
                      <textarea rows="3" value={siteContent.aboutHeroDesc} onChange={(e) => setSiteContent({ ...siteContent, aboutHeroDesc: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Título Sección Historia</label>
                      <input type="text" value={siteContent.historyTitle} onChange={(e) => setSiteContent({ ...siteContent, historyTitle: e.target.value })} placeholder="Nuestra Historia" />
                    </div>
                    <div className="form-group">
                      <label>📷 Imagen de Historia</label>
                      <div style={{ border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', position: 'relative' }}>
                        <img src={siteContent.historyImg || '/tech-bg.png'} alt="Preview Historia" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                        {siteContent.historyImg && !['/tech-bg.png'].includes(siteContent.historyImg) && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#E50914',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSiteImageDelete('historyImg');
                            }}
                            title="Eliminar imagen"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleSiteImageUpload('historyImg', e.target.files[0])} />
                    </div>
                  </div>
                </div>
              )}

              {activeSiteTab === 'global' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
                  <div className="admin-card">
                    <h3>⚙️ Identidad Global</h3>
                    <div className="form-group">
                      <label>📷 Logo de la Empresa</label>
                      <div style={{ background: '#000', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center', marginBottom: '8px', position: 'relative' }}>
                        <img src={siteContent.logo || '/logo-idatel.png'} alt="Logo Preview" style={{ height: '60px', maxWidth: '200px', objectFit: 'contain' }} />
                        {siteContent.logo && !['/logo-idatel.png'].includes(siteContent.logo) && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#E50914',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSiteImageDelete('logo');
                            }}
                            title="Eliminar logo"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleSiteImageUpload('logo', e.target.files[0])} />
                      <small style={{ color: '#666', fontSize: '0.75rem' }}>El logo aparece en el Header y Footer del sitio.</small>
                    </div>
                    <div className="form-group">
                      <label>Descripción del Footer</label>
                      <textarea rows="4" value={siteContent.footerDesc} onChange={(e) => setSiteContent({ ...siteContent, footerDesc: e.target.value })} placeholder="Conectando el futuro a través de redes de fibra óptica..." />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '2rem', position: 'sticky', bottom: '1.5rem', zIndex: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', boxShadow: '0 8px 32px rgba(229,9,20,0.4)' }} disabled={actionLoading || uploading}>
                  {actionLoading ? <><Loader2 className="spin-icon" /> Guardando...</> : <><Save size={20} /> Guardar Todos los Cambios del Sitio</>}
                </button>
              </div>
            </form>
          </div>
        )}


        {activeTab === 'access' && (
          <div className="admin-card content-card">
            <h3>Seguridad y Acceso</h3>
            <p style={{ color: '#b3b3b3', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Configura cómo deseas que los administradores inicien sesión en el sistema.
            </p>

            <form onSubmit={handleSaveAccessConfig} className="admin-form">
              <div className="bg-glass-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                      {accessConfig.loginMethod === 'email' ? 'Iniciar con Correo' : 'Iniciar con Nombre de Usuario'}
                    </h4>
                    <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>
                      {accessConfig.loginMethod === 'email'
                        ? 'Se requerirá el correo electrónico oficial.'
                        : 'Se utilizará un alias personalizado en lugar del correo.'}
                    </p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={accessConfig.loginMethod === 'username'}
                      onChange={(e) => setAccessConfig({
                        ...accessConfig,
                        loginMethod: e.target.checked ? 'username' : 'email'
                      })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {accessConfig.loginMethod === 'username' && (
                <div className="form-group" style={{ animation: 'slideDown 0.3s ease-out' }}>
                  <label className="input-label">Alias Único (Nombre de Usuario)</label>
                  <input
                    type="text"
                    placeholder="Ej: idatel_admin"
                    value={accessConfig.adminAlias}
                    onChange={(e) => setAccessConfig({ ...accessConfig, adminAlias: e.target.value })}
                    required={accessConfig.loginMethod === 'username'}
                  />
                  <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '8px' }}>
                    Este alias reemplazará al correo en la pantalla de inicio de sesión.
                  </p>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="spin-icon" /> : <Save size={18} />} Guardar Ajustes
              </button>
            </form>
          </div>
        )}

        {activeTab === 'empresa' && (
          <div className="admin-content-grid">
            {/* Company Info Form */}
            <div className="admin-card">
              <h3>Datos Corporativos</h3>
              <form onSubmit={handleSaveCompany} className="admin-form">
                <div className="form-group">
                  <label>Historia de la Empresa</label>
                  <textarea
                    rows="4"
                    value={companyData.historia}
                    onChange={(e) => setCompanyData({ ...companyData, historia: e.target.value })}
                    placeholder="Escribe la historia de Idatel..."
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Misión</label>
                  <textarea
                    rows="3"
                    value={companyData.mision}
                    onChange={(e) => setCompanyData({ ...companyData, mision: e.target.value })}
                    placeholder="¿Cuál es nuestra misión?"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Visión</label>
                  <textarea
                    rows="3"
                    value={companyData.vision}
                    onChange={(e) => setCompanyData({ ...companyData, vision: e.target.value })}
                    placeholder="¿Hacia dónde vamos?"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="spin-icon" /> : <Save size={18} />} Actualizar Información
                </button>
              </form>
            </div>

            {/* Nivel Names Management */}
            <div className="admin-card">
              <h3>Categorías del Organigrama</h3>
              <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Escribe el nombre de cada rango (Ej: Nivel 1 = Directores).</p>
              <div className="levels-manager">
                {Object.keys(companyData.niveles || {}).sort((a, b) => a - b).map(lvl => (
                  <div key={lvl} className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', minWidth: '80px' }}>Nivel {lvl}:</span>
                    <input
                      type="text"
                      value={companyData.niveles[lvl]}
                      onChange={(e) => {
                        const newNiveles = { ...companyData.niveles, [lvl]: e.target.value };
                        setCompanyData({ ...companyData, niveles: newNiveles });
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => {
                        if (Object.keys(companyData.niveles).length <= 1) return;
                        const newNiveles = { ...companyData.niveles };
                        delete newNiveles[lvl];
                        setCompanyData({ ...companyData, niveles: newNiveles });
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const keys = Object.keys(companyData.niveles).map(Number);
                    const nextLvl = keys.length > 0 ? Math.max(...keys) + 1 : 1;
                    if (nextLvl > 5) {
                      showMessage('error', 'Máximo 5 niveles permitidos.');
                      return;
                    }
                    const newNiveles = { ...companyData.niveles, [nextLvl]: `Nuevo Nivel ${nextLvl}` };
                    setCompanyData({ ...companyData, niveles: newNiveles });
                  }}
                >
                  <Plus size={14} /> Añadir Nivel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1.5rem', width: '100%' }}
                  disabled={actionLoading}
                  onClick={handleSaveCompany}
                >
                  {actionLoading ? <Loader2 className="spin-icon" /> : <Save size={16} />} Guardar Nombres de Categorías
                </button>
              </div>
            </div>


            {/* Team Management */}
            <div className="admin-card" id="team-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>{editingTeamMember ? 'Editar Integrante' : 'Equipo de Trabajo'}</h3>
                {teamMembers.length === 0 && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('¿Cargar integrantes de prueba?')) return;
                      setActionLoading(true);
                      const defaultTeam = [
                        { nombre: "Camilo Moreno", cargo: "Director General", linkedin: "#", fotoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop" },
                        { nombre: "Andrea Salazar", cargo: "Directora Técnica", linkedin: "#", fotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop" },
                        { nombre: "Luis García", cargo: "Soporte al Cliente", linkedin: "#", fotoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&fit=crop" }
                      ];
                      try {
                        for (const member of defaultTeam) {
                          await addDoc(collection(db, 'equipo'), member);
                        }
                        showMessage('success', 'Equipo de prueba cargado.');
                        fetchInitialData();
                      } catch (err) {
                        showMessage('error', 'Error al cargar equipo.');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.7rem' }}
                  >
                    ✨ Cargar Demo
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveTeamMember} className="admin-form" style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #333' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={teamForm.nombre}
                      onChange={(e) => setTeamForm({ ...teamForm, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cargo</label>
                    <input
                      type="text"
                      value={teamForm.cargo}
                      onChange={(e) => setTeamForm({ ...teamForm, cargo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rango Jerárquico</label>
                    <select
                      value={teamForm.nivel}
                      onChange={(e) => setTeamForm({ ...teamForm, nivel: Number(e.target.value) })}
                    >
                      {Object.entries(companyData.niveles || {}).sort(([a], [b]) => a - b).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label>Foto del Integrante</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={teamForm.fotoUrl}
                        onChange={(e) => setTeamForm({ ...teamForm, fotoUrl: e.target.value, file: null })}
                        placeholder="URL de la imagen..."
                        style={{ flex: 1 }}
                        disabled={!!fileToUpload}
                      />
                      <label
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Subir desde PC"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setFileToUpload(e.target.files[0]);
                              setTeamForm({ ...teamForm, fotoUrl: e.target.files[0].name });
                            }
                          }}
                        />
                        <Upload size={20} />
                      </label>
                    </div>
                    {fileToUpload && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Archivo seleccionado: {fileToUpload.name}
                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setFileToUpload(null); setTeamForm({ ...teamForm, fotoUrl: '' }) }}> (Quitar)</span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input
                      type="text"
                      value={teamForm.linkedin}
                      onChange={(e) => setTeamForm({ ...teamForm, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading || uploading}>
                  {uploading ? <Loader2 className="spin-icon" /> : editingTeamMember ? <Save size={16} /> : <Plus size={16} />}
                  {uploading ? 'Subiendo imagen...' : editingTeamMember ? 'Actualizar Integrante' : 'Añadir Integrante'}
                </button>
                {editingTeamMember && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                      setEditingTeamMember(null);
                      setTeamForm({ nombre: '', cargo: '', linkedin: '', fotoUrl: '' });
                      setFileToUpload(null);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </form>

              <div className="team-list">
                {teamMembers.sort((a, b) => (a.nivel || 3) - (b.nivel || 3)).map(member => (
                  <div key={member.id} className="team-item-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#000', borderRadius: '8px', marginBottom: '0.5rem' }}>
                    <img src={member.fotoUrl} alt={member.nombre} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{member.nombre}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {companyData.niveles[member.nivel] || 'Equipo'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{member.cargo}</div>
                    </div>
                    <div className="table-actions">
                      <button className="action-btn edit" onClick={() => startEditTeamMember(member)}><Edit size={16} /></button>
                      <button onClick={() => deleteTeamMember(member.id)} className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="admin-content-grid">
            {/* Update Display Name */}
            <div className="admin-card">
              <h3><UserCog size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Cambiar Nombre</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Este nombre se mostrará en el sistema administrativo.
              </p>
              <form onSubmit={handleUpdateDisplayName} className="admin-form">
                <div className="form-group">
                  <label>Nombre actual</label>
                  <input
                    type="text"
                    value={user?.displayName || 'Sin nombre configurado'}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label>Nuevo nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={profileLoading.name}>
                  {profileLoading.name ? <Loader2 className="spin-icon" /> : <Save size={18} />}
                  Actualizar Nombre
                </button>
              </form>
            </div>

            {/* Update Email */}
            <div className="admin-card">
              <h3><Mail size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Cambiar Correo</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Se enviará un correo de verificación al nuevo email. Debes verificarlo para completar el cambio.
              </p>
              <form onSubmit={handleUpdateEmail} className="admin-form">
                <div className="form-group">
                  <label>Correo actual</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label>Nuevo correo</label>
                  <input
                    type="email"
                    placeholder="nuevo@correo.com"
                    value={profileForm.newEmail}
                    onChange={(e) => setProfileForm({ ...profileForm, newEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña actual (para verificar identidad)</label>
                  <input
                    type="password"
                    placeholder="Tu contraseña actual"
                    value={profileForm.currentPasswordForEmail}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPasswordForEmail: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={profileLoading.email}>
                  {profileLoading.email ? <Loader2 className="spin-icon" /> : <Save size={18} />}
                  Actualizar Correo
                </button>
              </form>
            </div>

            {/* Update Password */}
            <div className="admin-card">
              <h3><Lock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Cambiar Contraseña</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Usa una contraseña segura con al menos 6 caracteres.
              </p>
              <form onSubmit={handleUpdatePassword} className="admin-form">
                <div className="form-group">
                  <label>Contraseña actual</label>
                  <input
                    type="password"
                    placeholder="Tu contraseña actual"
                    value={profileForm.currentPasswordForPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPasswordForPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="Repite la nueva contraseña"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={profileLoading.password}>
                  {profileLoading.password ? <Loader2 className="spin-icon" /> : <Save size={18} />}
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          background: #000;
          color: white;
          font-family: 'Montserrat', sans-serif;
        }

        .admin-sidebar {
          width: 280px;
          background: #141414;
          border-right: 1px solid #333;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-brand img {
          height: 60px;
          margin-bottom: 3rem;
        }

        .sidebar-nav {
          flex: 1;
        }

        .sidebar-nav button {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          padding: 1rem;
          background: transparent;
          color: #b3b3b3;
          border: none;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          font-weight: 600;
          transition: 0.3s;
          text-align: left;
        }

        .sidebar-nav button:hover, .sidebar-nav button.active {
          background: #333;
          color: white;
        }

        .logout-btn {
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #E50914;
          font-weight: 700;
          cursor: pointer;
        }

        .admin-main {
          flex: 1;
          margin-left: 280px;
          padding: 3rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .admin-header h1 {
          font-size: 1.8rem;
          font-weight: 800;
        }

        .admin-alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          animation: float 0.3s ease-out;
        }

        .admin-alert.success { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid #2ecc71; }
        .admin-alert.error { background: rgba(229, 9, 20, 0.2); color: #e50914; border: 1px solid #e50914; }

        .admin-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .admin-card {
           background: #141414;
           padding: 2rem;
           border-radius: 12px;
           border: 1px solid #333;
        }

        .admin-card h3 {
          margin-bottom: 1.5rem;
          font-weight: 800;
          color: white;
        }

        .admin-form .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #b3b3b3;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.8rem 1rem;
          background: #000;
          border: 1px solid #333;
          color: white;
          border-radius: 6px;
          font-family: inherit;
        }

        .form-group.checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input { width: auto; }

        .form-actions {
          display: flex;
          gap: 1rem;
        }

        .plans-table-wrapper {
          overflow-x: auto;
        }

        .plans-table {
          width: 100%;
          border-collapse: collapse;
        }

        .plans-table th {
          text-align: left;
           padding: 1rem;
           color: #b3b3b3;
           border-bottom: 2px solid #333;
        }

        .plans-table td {
           padding: 1rem;
           border-bottom: 1px solid #333;
        }

        .table-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border-radius: 4px;
          color: white;
        }

        .action-btn.edit { background: #333; }
        .action-btn.delete { background: #E50914; }

        .admin-loading {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #b3b3b3;
        }

        .content-card {
          max-width: 800px;
        }

        .mobile-toggle {
          display: none;
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1001;
          background: #E50914;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
           .mobile-toggle { display: block; }
           
           .admin-sidebar {
             position: fixed;
             left: -100%;
             top: 0;
             width: 250px;
             height: 100vh;
             z-index: 1000;
             transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           }

           .admin-sidebar.open {
             left: 0;
             box-shadow: 10px 0 30px rgba(0,0,0,0.5);
           }

           .admin-main {
             margin-left: 0;
             padding: 4rem 1.5rem 1.5rem;
           }

           .admin-content-grid {
             grid-template-columns: 1fr;
           }

           .admin-header {
             flex-direction: column;
             align-items: flex-start;
             gap: 1rem;
           }

           .list-header {
             flex-direction: column;
             align-items: flex-start !important;
           }

           .search-bar {
             max-width: 100% !important;
             width: 100%;
           }

           .admin-alert {
             margin-top: 1rem;
           }

           .form-row {
             grid-template-columns: 1fr !important;
           }
        }

      `}</style>
    </div>
  );
};

export default AdminDashboard;
