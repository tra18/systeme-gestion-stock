/**
 * Génère une empreinte unique de l'appareil
 * Combine plusieurs caractéristiques pour créer un identifiant unique
 * Plus sécurisé que l'adresse MAC (qui n'est pas accessible via navigateur)
 */

export const generateDeviceFingerprint = async () => {
  const components = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Langue
  components.push(navigator.language);

  // 3. Fuseau horaire
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Résolution de l'écran
  components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);

  // 5. Plugins (pour desktop)
  if (navigator.plugins && navigator.plugins.length > 0) {
    const plugins = Array.from(navigator.plugins)
      .map(p => p.name)
      .sort()
      .join(',');
    components.push(plugins);
  }

  // 6. Canvas fingerprint (très unique)
  const canvasFingerprint = getCanvasFingerprint();
  components.push(canvasFingerprint);

  // 7. WebGL fingerprint
  const webglFingerprint = getWebGLFingerprint();
  components.push(webglFingerprint);

  // 8. Mémoire de l'appareil (si disponible)
  if (navigator.deviceMemory) {
    components.push(navigator.deviceMemory.toString());
  }

  // 9. Nombre de cœurs CPU (si disponible)
  if (navigator.hardwareConcurrency) {
    components.push(navigator.hardwareConcurrency.toString());
  }

  // 10. Platform
  components.push(navigator.platform);

  // 11. Touch support
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  components.push(touchSupport.toString());

  // Combiner toutes les composantes
  const fingerprint = components.join('|');

  // Générer un hash SHA-256
  const hash = await hashString(fingerprint);

  return hash;
};

// Fonction pour générer un fingerprint Canvas (très unique par appareil)
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 50;
    
    // Dessiner du texte avec différents styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Pointage RH', 4, 17);

    // Convertir en dataURL
    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
};

// Fonction pour générer un fingerprint WebGL
const getWebGLFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}~${renderer}`;
    }

    return gl.getParameter(gl.VERSION);
  } catch (e) {
    return 'webgl-error';
  }
};

// Fonction pour hasher une chaîne avec SHA-256
const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Fonction pour obtenir des informations sur l'appareil
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Détecter le type d'appareil
  const isMobile = /mobile|android|iphone|ipad|ipod/.test(userAgent);
  const isTablet = /ipad|tablet/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  // Détecter le navigateur
  let browser = 'Unknown';
  if (/firefox/.test(userAgent)) browser = 'Firefox';
  else if (/chrome/.test(userAgent)) browser = 'Chrome';
  else if (/safari/.test(userAgent)) browser = 'Safari';
  else if (/edge/.test(userAgent)) browser = 'Edge';

  // Détecter le système d'exploitation
  let os = 'Unknown';
  if (isAndroid) os = 'Android';
  else if (isIOS) os = 'iOS';
  else if (/windows/.test(userAgent)) os = 'Windows';
  else if (/mac/.test(userAgent)) os = 'macOS';
  else if (/linux/.test(userAgent)) os = 'Linux';

  return {
    isMobile,
    isTablet,
    isAndroid,
    isIOS,
    browser,
    os,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    userAgent: navigator.userAgent
  };
};

// Fonction pour vérifier si deux fingerprints correspondent (avec tolérance)
export const fingerprintsMatch = (fp1, fp2, tolerance = 0) => {
  if (tolerance === 0) {
    return fp1 === fp2;
  }
  
  // Si tolérance > 0, on peut comparer les premiers caractères
  // Utile si le fingerprint change légèrement (mise à jour navigateur, etc.)
  return fp1.substring(0, fp1.length - tolerance) === fp2.substring(0, fp2.length - tolerance);
};

