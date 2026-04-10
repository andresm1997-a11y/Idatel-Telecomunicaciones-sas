/**
 * Idatel API Service (Simulado)
 * 
 * Este módulo contiene las llamadas a backend. 
 * Actualmente simula la red utilizando Promesas (Promise) y setTimeout 
 * para poder integrarse al frontend y ser posteriormente 
 * reemplazado por la API final sin afectar la arquitectura de React.
 */

// Teléfono base para la API de WhatsApp
export const WHATSAPP_NUMBER = "573144310460"; 

export const COVERAGE_CITIES = [
  "simacota", "la llanita", "chima", "contratacion", "palmar", "hato", 
  "galan", "socorro", "palmas del socorro", "confines", "guapota", 
  "oiba", "guadalupe", "olival", "tolota", "vadorreal", "suaita", "santana"
];

export const apiService = {
  /**
   * Simula la verificación de cobertura de fibra óptica.
   * @param {string} address - La dirección introducida por el usuario
   * @returns {Promise<Object>} Resultado de la cobertura
   */
  checkCoverage: async (address) => {
    return new Promise((resolve, reject) => {
      // Simulamos latencia de red (1.5 segundos)
      setTimeout(() => {
        if (!address || address.length < 3) {
          reject({ status: 'error', message: 'Por favor ingresa un municipio válido.' });
          return;
        }

        const normalizedAddress = address.trim().toLowerCase();
        
        // Simulamos la lógica del backend validando contra el array de ciudades: 
        const isCovered = COVERAGE_CITIES.some(city => normalizedAddress.includes(city));

        if (isCovered) {
          resolve({
            status: 'success',
            message: '¡Felicidades! Tenemos cobertura de Fibra Óptica en tu zona. Elige tu plan abajo.',
            covered: true
          });
        } else {
          resolve({
            status: 'warning',
            message: 'Lo sentimos, actualmente no contamos con cobertura para este municipio.',
            covered: false
          });
        }
      }, 1500); // 1500 ms delay
    });
  },

  /**
   * Generador de URL para la API de WhatsApp 
   * @param {string} message - Mensaje base a enviar
   * @returns {string} URL formada de wa.me
   */
  generateWhatsAppLink: (message) => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  }
};
