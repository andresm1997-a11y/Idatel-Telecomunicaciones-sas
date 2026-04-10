import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { toast } from 'react-hot-toast';

const AccessSettings = () => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [usernameAlias, setUsernameAlias] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aliasExists, setAliasExists] = useState(false);

  useEffect(() => {
    loadAccessConfig();
  }, []);

  const loadAccessConfig = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'config_acceso', 'main'));
      if (configDoc.exists()) {
        const data = configDoc.data();
        setLoginMethod(data.method || 'email');
        setUsernameAlias(data.usernameAlias || '');
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAliasExists = async (alias) => {
    const q = query(collection(db, 'config_acceso'), where('usernameAlias', '==', alias));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleLoginMethodChange = async (newMethod) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'config_acceso', 'main'), {
        method: newMethod,
        usernameAlias: newMethod === 'username' ? usernameAlias : '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setLoginMethod(newMethod);
      toast.success('Método de acceso actualizado');
    } catch (error) {
      toast.error('Error al guardar cambios');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAliasChange = async (newAlias) => {
    setUsernameAlias(newAlias);
    
    if (newAlias.length > 2) {
      const exists = await checkAliasExists(newAlias);
      setAliasExists(exists);
    } else {
      setAliasExists(false);
    }
  };

  const handleSaveAlias = async () => {
    if (!usernameAlias.trim()) {
      toast.error('El alias no puede estar vacío');
      return;
    }

    if (aliasExists) {
      toast.error('Este alias ya está en uso');
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'config_acceso', 'main'), {
        usernameAlias: usernameAlias.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Alias guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar alias');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Ajustes de Acceso</h2>
      
      <div className="space-y-6">
        {/* Selector de Método */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Método de Inicio de Sesión</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 font-medium">
                {loginMethod === 'email' ? 'Iniciar con Correo' : 'Iniciar con Nombre de Usuario'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {loginMethod === 'email' 
                  ? 'Los usuarios ingresarán su correo electrónico' 
                  : 'Los usuarios ingresarán un alias único'}
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={loginMethod === 'username'}
                onChange={(e) => handleLoginMethodChange(e.target.checked ? 'username' : 'email')}
                disabled={isSaving}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Gestión de Alias */}
        {loginMethod === 'username' && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Configurar Alias</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alias único para el sistema
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usernameAlias}
                    onChange={(e) => handleAliasChange(e.target.value)}
                    placeholder="Ej: admin, sistema, idatel"
                    className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      aliasExists ? 'border-red-500' : 'border-gray-600'
                    }`}
                    disabled={isSaving}
                  />
                  {aliasExists && (
                    <p className="absolute -bottom-6 left-0 text-sm text-red-400">
                      Este alias ya está en uso
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleSaveAlias}
                disabled={isSaving || !usernameAlias.trim() || aliasExists}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
              >
                {isSaving ? 'Guardando...' : 'Guardar Alias'}
              </button>
            </div>
          </div>
        )}

        {/* Información Adicional */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Información</h3>
          <p className="text-gray-300 text-sm">
            {loginMethod === 'email'
              ? 'El sistema utilizará el método tradicional de correo electrónico para el inicio de sesión.'
              : 'El sistema permitirá iniciar sesión con un alias único que se asocia internamente a un correo electrónico de Firebase.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessSettings;
