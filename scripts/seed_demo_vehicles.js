import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Error: No se pudieron leer las credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseServiceKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const SEED_VEHICLES = [
  {
    title: 'Toyota Corolla 2.0 SEG CVT',
    category: 'autos',
    category_label: 'Autos',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    mileage: '18.000 km',
    mileage_num: 18000,
    fuel: 'Nafta',
    transmission: 'Automática',
    price_currency: 'USD',
    price: 26500,
    formatted_price: 'USD 26.500',
    location: 'Buenos Aires, CABA',
    seller_type: 'Agencia Verificada',
    seller_name: 'KevDev Premium Motors',
    seller_whatsapp: '5491134567890',
    badge: 'Destacado',
    badge_color: 'indigo',
    image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Excelente unidad 2023 en estado inmaculado. Único dueño, service oficiales al día en concesionario oficial Toyota. Equipamiento SEG tope de gama con Toyota Safety Sense, tapizados de cuero e interior bi-color.',
    features: ['Toyota Safety Sense', 'Asientos de Cuero', 'Cámara 360°', 'Apple CarPlay / Android Auto', 'Llantas R17'],
    status: 'active'
  },
  {
    title: 'Volkswagen Amarok V6 Extreme 3.0 TDI 4x4',
    category: 'camionetas',
    category_label: 'Pick-ups',
    brand: 'Volkswagen',
    model: 'Amarok',
    year: 2022,
    mileage: '34.000 km',
    mileage_num: 34000,
    fuel: 'Diésel',
    transmission: 'Automática 8va',
    price_currency: 'USD',
    price: 42900,
    formatted_price: 'USD 42.900',
    location: 'Córdoba, Capital',
    seller_type: 'Particular Verificado',
    seller_name: 'Martín Rossi',
    seller_whatsapp: '5493512345678',
    badge: 'Oportunidad',
    badge_color: 'emerald',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Amarok V6 258 CV en impecable estado. Todos los mantenimientos realizados en concesionario oficial. Tracción integral 4Motion con caja ZF de 8 velocidades. Cobertor de caja y lona marítima original incluidos.',
    features: ['Motor V6 258 CV', 'Tracción 4Motion', 'Llantas Talca 20"', 'Butacas ErgoComfort', 'Faros Bi-Xenón'],
    status: 'active'
  },
  {
    title: 'Ford Mustang GT 5.0 V8 Performance Pack',
    category: 'autos',
    category_label: 'Autos',
    brand: 'Ford',
    model: 'Mustang GT',
    year: 2023,
    mileage: '8.500 km',
    mileage_num: 8500,
    fuel: 'Nafta',
    transmission: 'Automática 10ma',
    price_currency: 'USD',
    price: 68500,
    formatted_price: 'USD 68.500',
    location: 'Buenos Aires, CABA',
    seller_type: 'Agencia Verificada',
    seller_name: 'GT Motors Exclusive',
    seller_whatsapp: '5491134567891',
    badge: 'Destacado',
    badge_color: 'rose',
    image_url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Icono americano Mustang GT motor Coyot 5.0L V8 con 466 CV. Paquete Performance con frenos Brembo de 6 pistones, escape de válvula activa y suspensión MagneRide. Estado de 0km sin detalles.',
    features: ['Motor 5.0 V8 466 CV', 'Frenos Brembo 6 pistones', 'Escape Activo Quad', 'Audio B&O 12 parlantes', 'Track Apps'],
    status: 'active'
  },
  {
    title: 'BMW S1000RR ABS Performance',
    category: 'motos',
    category_label: 'Motos',
    brand: 'BMW',
    model: 'S1000RR',
    year: 2024,
    mileage: '2.500 km',
    mileage_num: 2500,
    fuel: 'Nafta',
    transmission: 'Manual 6ta',
    price_currency: 'USD',
    price: 38000,
    formatted_price: 'USD 38.000',
    location: 'Santa Fe, Rosario',
    seller_type: 'Agencia Verificada',
    seller_name: 'MotorSport Club',
    seller_whatsapp: '5493415678901',
    badge: 'Nuevo Ingreso',
    badge_color: 'blue',
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Superbike definitiva 2024 con paquete M Performance. Escape completo de titanio Akrapovic, modos de conducción Pro, Quickshifter bidireccional y pantalla TFT de 6.5 pulgadas.',
    features: ['Paquete M Performance', 'Escape Akrapovic Titanio', 'Quickshifter Pro', 'Control de Tracción Dinámico'],
    status: 'active'
  },
  {
    title: 'Ford Ranger Limited 3.0 V6 4x4 0KM',
    category: 'camionetas',
    category_label: 'Pick-ups',
    brand: 'Ford',
    model: 'Ranger',
    year: 2024,
    mileage: '0 km',
    mileage_num: 0,
    fuel: 'Diésel',
    transmission: 'Automática 10ma',
    price_currency: 'USD',
    price: 54000,
    formatted_price: 'USD 54.000',
    location: 'Mendoza, Guaymallén',
    seller_type: 'Agencia Verificada',
    seller_name: 'Ford Select Oficial',
    seller_whatsapp: '5492614567890',
    badge: '0KM Destacado',
    badge_color: 'violet',
    image_url: 'https://images.unsplash.com/photo-1609521263047-f8d205293f24?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8d205293f24?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Nueva generación Ford Ranger Limited V6 250 CV. Pantalla vertical SYNC 4 de 12", tablero 100% digital, tracción 4x4 inteligente con selector de modos de terreno y asistencia a la conducción Co-Pilot 360.',
    features: ['Motor V6 250 CV', 'Pantalla SYNC 4 12"', 'Ford Co-Pilot 360', 'Tablero Digital 12.4"'],
    status: 'active'
  },
  {
    title: 'Porsche 911 Carrera S Turbo Look',
    category: 'autos',
    category_label: 'Autos',
    brand: 'Porsche',
    model: '911 Carrera S',
    year: 2021,
    mileage: '12.000 km',
    mileage_num: 12000,
    fuel: 'Nafta',
    transmission: 'Automática PDK 8va',
    price_currency: 'USD',
    price: 245000,
    formatted_price: 'USD 245.000',
    location: 'Buenos Aires, San Isidro',
    seller_type: 'Particular Verificado',
    seller_name: 'Agustín De la Torre',
    seller_whatsapp: '5491198765432',
    badge: 'Colección',
    badge_color: 'amber',
    image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Porsche 992 Carrera S impecable. Paquete Sport Chrono, escape deportivo Porsche Exclusive Manufaktur, suspensión pasiva PASM rebajada -10mm y audio Burmester High-End Surround System.',
    features: ['Sport Chrono Package', 'Audio Burmester High-End', 'Frenos Cerámicos PCCB', 'Llantas Carrera Classic 20/21"'],
    status: 'active'
  },
  {
    title: 'Sea-Doo RXT-X 300 Moto de Agua',
    category: 'nautica',
    category_label: 'Náutica',
    brand: 'Sea-Doo',
    model: 'RXT-X 300',
    year: 2023,
    mileage: '45 hs',
    mileage_num: 45,
    fuel: 'Nafta',
    transmission: 'Direct Drive',
    price_currency: 'USD',
    price: 24500,
    formatted_price: 'USD 24.500',
    location: 'Buenos Aires, Tigre',
    seller_type: 'Particular Verificado',
    seller_name: 'Federico Náutica',
    seller_whatsapp: '5491145678901',
    badge: 'Náutica Premium',
    badge_color: 'cyan',
    image_url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Moto de agua de altísimo rendimiento Sea-Doo RXT-X 300 HP. Casco ST3 de máxima estabilidad en mar abierto, sistema de audio Bluetooth BRP Premium y tráiler de aluminio homologado incluido.',
    features: ['Motor Rotax 1630 ACE 300 HP', 'Sistema Audio BRP Bluetooth', 'Tráiler de Aluminio', 'Modo Launch Control'],
    status: 'active'
  },
  {
    title: 'Scania R450 6x2 Highline Streamline',
    category: 'camiones',
    category_label: 'Comerciales',
    brand: 'Scania',
    model: 'R450',
    year: 2021,
    mileage: '140.000 km',
    mileage_num: 140000,
    fuel: 'Diésel',
    transmission: 'Opticruise',
    price_currency: 'USD',
    price: 115000,
    formatted_price: 'USD 115.000',
    location: 'Santa Fe, Rosario Port',
    seller_type: 'Agencia Verificada',
    seller_name: 'Camiones del Sur S.A.',
    seller_whatsapp: '5493418901234',
    badge: 'Comercial',
    badge_color: 'orange',
    image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Tractor 6x2 Scania R450 de larga distancia. Cabina Highline ultra confort con cama doble, heladera abordo, freno de retardo Scania Retarder y telemetría Scania Communicator integrada.',
    features: ['Scania Retarder', 'Caja Opticruise sin embrague', 'Cabina Highline Cama Doble', 'Climatizador de Cabina'],
    status: 'active'
  },
  {
    title: 'Honda CR-V 1.5T Touring AWD',
    category: 'autos',
    category_label: 'Autos',
    brand: 'Honda',
    model: 'CR-V',
    year: 2022,
    mileage: '29.000 km',
    mileage_num: 29000,
    fuel: 'Nafta',
    transmission: 'Automática CVT',
    price_currency: 'USD',
    price: 39800,
    formatted_price: 'USD 39.800',
    location: 'Buenos Aires, Pilar',
    seller_type: 'Particular Verificado',
    seller_name: 'Gonzalo Benítez',
    seller_whatsapp: '5491123456789',
    badge: 'Único Dueño',
    badge_color: 'indigo',
    image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Honda CR-V Touring 1.5 Turbo tracción Areal AWD. Techo solar panorámico eléctrico, baúl con apertura manos libres por sensor, paquete Honda Sensing de manejo autónomo nivel 2.',
    features: ['Honda Sensing', 'Techo Panorámico', 'Tracción AWD Real Time', 'Apertura Manos Libres'],
    status: 'active'
  },
  {
    title: 'Toyota Hilux 2.8 GR-Sport IV 4x4 AT',
    category: 'camionetas',
    category_label: 'Pick-ups',
    brand: 'Toyota',
    model: 'Hilux GR',
    year: 2023,
    mileage: '15.000 km',
    mileage_num: 15000,
    fuel: 'Diésel',
    transmission: 'Automática 6ta',
    price_currency: 'USD',
    price: 49900,
    formatted_price: 'USD 49.900',
    location: 'Córdoba, Villa Carlos Paz',
    seller_type: 'Agencia Verificada',
    seller_name: 'Gazoo Racing Center',
    seller_whatsapp: '5493519876543',
    badge: 'Imperdible',
    badge_color: 'emerald',
    image_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Edición limitada Gazoo Racing IV de 224 CV con trochas ensanchadas y amortiguadores de competición monotubo Fox. Llantas exclusivas R17 y estética deportiva extrema.',
    features: ['Motor 2.8 Turbo 224 CV', 'Amortiguadores Monotubo GR', 'Trochas Ensanchadas +140mm', 'Asientos de Alcántara Gazoo'],
    status: 'active'
  },
  {
    title: 'Audi Q7 3.0 TDI Quattro Tiptronic',
    category: 'autos',
    category_label: 'Autos',
    brand: 'Audi',
    model: 'Q7',
    year: 2020,
    mileage: '48.000 km',
    mileage_num: 48000,
    fuel: 'Diésel',
    transmission: 'Automática 8va',
    price_currency: 'USD',
    price: 62000,
    formatted_price: 'USD 62.000',
    location: 'Buenos Aires, Belgrano',
    seller_type: 'Agencia Verificada',
    seller_name: 'Audi Select Center',
    seller_whatsapp: '5491143218765',
    badge: 'Garantía Oficial',
    badge_color: 'blue',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'SUV de 7 plazas de lujo extremo. Suspensión neumática adaptativa, Virtual Cockpit 12.3", tracción Quattro permanente y sistema de sonido Bang & Olufsen 3D.',
    features: ['7 Pasajeros', 'Suspensión Neumática', 'Virtual Cockpit', 'Audio Bang & Olufsen 3D'],
    status: 'active'
  },
  {
    title: 'Yamaha MT-09 ABS Hyper Naked',
    category: 'motos',
    category_label: 'Motos',
    brand: 'Yamaha',
    model: 'MT-09',
    year: 2023,
    mileage: '5.200 km',
    mileage_num: 5200,
    fuel: 'Nafta',
    transmission: 'Manual 6ta',
    price_currency: 'USD',
    price: 18500,
    formatted_price: 'USD 18.500',
    location: 'Mendoza, Capital',
    seller_type: 'Particular Verificado',
    seller_name: 'Lucas Peralta',
    seller_whatsapp: '5492615678901',
    badge: 'Oportunidad',
    badge_color: 'emerald',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Naked tricilíndrica CP3 de 890cc y 119 CV. Chasis liviano de aluminio, sensor IMU de 6 ejes con control de tracción sensible al ángulo de inclinación y cambio rápido Quickshifter.',
    features: ['Motor CP3 890cc 119 CV', 'Sensor IMU 6 ejes', 'Quickshifter Up/Down', 'Pantalla TFT 3.5"'],
    status: 'active'
  },
  {
    title: 'Peugeot 208 GT 1.2 Turbo Tiptronic',
    category: 'autos',
    category_label: 'Autos',
    brand: 'Peugeot',
    model: '208 GT',
    year: 2023,
    mileage: '11.000 km',
    mileage_num: 11000,
    fuel: 'Nafta',
    transmission: 'Automática 6ta',
    price_currency: 'USD',
    price: 22400,
    formatted_price: 'USD 22.400',
    location: 'Buenos Aires, Nordelta',
    seller_type: 'Particular Verificado',
    seller_name: 'Sofia Martinez',
    seller_whatsapp: '5491187654321',
    badge: 'Nuevo Ingreso',
    badge_color: 'violet',
    image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Peugeot 208 GT tope de gama deportivo. Tablero i-Cockpit 3D con proyección holográfica, techo panorámico vidriado skyview, faros Full LED "Garras de León" y paquete ADAS completo.',
    features: ['i-Cockpit 3D Holográfico', 'Techo Skyview', 'Faros Full LED', 'Frenado Autónomo de Emergencia'],
    status: 'active'
  },
  {
    title: 'Mercedes-Benz C300 AMG Line',
    category: 'autos',
    category_label: 'Autos',
    brand: 'Mercedes-Benz',
    model: 'C300',
    year: 2022,
    mileage: '21.000 km',
    mileage_num: 21000,
    fuel: 'Nafta',
    transmission: 'Automática 9G-Tronic',
    price_currency: 'USD',
    price: 75000,
    formatted_price: 'USD 75.000',
    location: 'Buenos Aires, CABA',
    seller_type: 'Agencia Verificada',
    seller_name: 'Star Luxury Motors',
    seller_whatsapp: '5491122334455',
    badge: 'Destacado',
    badge_color: 'rose',
    image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Mercedes C300 W206 generación actual con kit estético AMG Line. Pantalla central tipo tablet MBUX 11.9", iluminación ambiental 64 colores, llantas AMG 19" y faros Digital Light.',
    features: ['Kit AMG Line', 'Pantalla MBUX 11.9"', 'Faros Digital Light', 'Audio Burmester 3D'],
    status: 'active'
  },
  {
    title: 'Lancha Bermuda Sport 180 Yamaha 115HP',
    category: 'nautica',
    category_label: 'Náutica',
    brand: 'Bermuda',
    model: 'Sport 180',
    year: 2022,
    mileage: '60 hs',
    mileage_num: 60,
    fuel: 'Nafta',
    transmission: 'Fuera de Borda',
    price_currency: 'USD',
    price: 21000,
    formatted_price: 'USD 21.000',
    location: 'Entre Ríos, Paraná',
    seller_type: 'Particular Verificado',
    seller_name: 'Camila Rodriguez',
    seller_whatsapp: '5493434567890',
    badge: 'Náutica',
    badge_color: 'cyan',
    image_url: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544885935-98dd03b09034?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Lancha deportiva 18 pies en excelente estado. Motor Yamaha 115 HP 4 Tiempos de bajísimo consumo. Torre de wakeboard de acero inoxidable, alfombras de teka sintética Eva y eco-sonda Garmin.',
    features: ['Motor Yamaha 115 HP 4T', 'Torre de Wakeboard', 'Ecosonda Garmin Striker', 'Audio Alpine Náutico'],
    status: 'active'
  },
  {
    title: 'Volvo FH 540 6x4 Tractor Pesado',
    category: 'camiones',
    category_label: 'Comerciales',
    brand: 'Volvo',
    model: 'FH 540',
    year: 2022,
    mileage: '95.000 km',
    mileage_num: 95000,
    fuel: 'Diésel',
    transmission: 'I-Shift',
    price_currency: 'USD',
    price: 138000,
    formatted_price: 'USD 138.000',
    location: 'Santa Fe, Capital',
    seller_type: 'Agencia Verificada',
    seller_name: 'Transpesados S.A.',
    seller_whatsapp: '5493425678901',
    badge: 'Comercial',
    badge_color: 'orange',
    image_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Tractor 6x4 de máxima potencia Volvo FH 540 HP. Caja I-Shift con modos de carga pesada, dirección dinámica VDS (Volvo Dynamic Steering), pantalla digital configurable y frenado de emergencia autónomo VEB+.',
    features: ['Volvo Dynamic Steering (VDS)', 'Motor 540 HP I-Shift', 'Freno VEB+ 510 CV', 'Cabina Globetrotter XL'],
    status: 'active'
  }
];

async function seed() {
  console.log('--- Iniciando inserción de 16 vehículos de muestra en Supabase ---');

  // Delete current records first to avoid duplicates
  const { error: delErr } = await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.warn('Advertencia al limpiar registros anteriores:', delErr.message);
  } else {
    console.log('✓ Tabla `vehicles` vaciada correctamente.');
  }

  // Insert seed data
  const { data, error } = await supabase.from('vehicles').insert(SEED_VEHICLES).select();

  if (error) {
    console.error('❌ Error al insertar vehículos en Supabase:', error);
  } else {
    console.log(`✅ ¡Se han insertado exitosamente ${data.length} vehículos con imágenes HD en Supabase!`);
  }
}

seed();
