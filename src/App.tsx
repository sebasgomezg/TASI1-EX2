/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Thermometer, 
  Activity, 
  Battery,
  Home,
  MapPin,
  Bell,
  User,
  ArrowRight,
  Wifi,
  Cpu,
  Info,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View, Zone, Sector, Block, Panel, Telemetry } from './types';

// Mock Data
const INITIAL_ZONES: Zone[] = [
  { id: 'z1', name: 'Parque Solar Ica Norte', location: 'Ica · Ica · La Tinguiña', coords: '-14.0833°, -75.7333°', altitude: 'Alt. 420 m.s.n.m.', status: 'ACTIVO' },
  { id: 'z2', name: 'Parque Solar Arequipa Sur', location: 'Arequipa · Arequipa · Cerro Colorado', coords: '-16.4090°, -71.5375°', altitude: 'Alt. 2335 m.s.n.m.', status: 'ACTIVO' }
];

const INITIAL_SECTORS: Sector[] = [
  { id: 's1', zoneId: 'z1', name: 'Sector A', description: 'Zona de paneles orientados al noroeste', status: 'ACTIVO' },
  { id: 's2', zoneId: 'z1', name: 'Sector B', description: 'Zona de paneles orientados al suroeste', status: 'ACTIVO' },
  { id: 's3', zoneId: 'z2', name: 'Sector Único', description: 'Zona principal de Arequipa', status: 'ACTIVO' }
];

const INITIAL_BLOCKS: Block[] = [
  { id: 'b1', sectorId: 's1', name: 'Bloque A1', type: 'TP-550W Monocristalino', power: '550W', capacity: 12, status: 'OPERATIVO' },
  { id: 'b2', sectorId: 's1', name: 'Bloque A2', type: 'TP-550W Monocristalino', power: '550W', capacity: 16, status: 'OPERATIVO' },
  { id: 'b3', sectorId: 's2', name: 'Bloque B1', type: 'TP-450W Policristalino', power: '450W', capacity: 16, status: 'OPERATIVO' }
];

const INITIAL_PANELS: Panel[] = [
  { id: 'p1', blockId: 'b1', name: 'Panel A1-001', serial: 'SN-ICA-A1-001', type: 'TP-550W Monocristalino', installationDate: '01/01/2025', row: 1, col: 1, status: 'OPERATIVO', terminalId: 'TIO-A1-001', mac: 'MAC-001' },
  { id: 'p2', blockId: 'b1', name: 'Panel A1-002', serial: 'SN-ICA-A1-002', type: 'TP-550W Monocristalino', installationDate: '01/01/2025', row: 1, col: 2, status: 'ALERTA', terminalId: 'TIO-A1-002', mac: 'MAC-002' },
];

export default function App() {
  const [history, setHistory] = useState<View[]>(['LOGIN']);
  const currentView = history[history.length - 1];
  
  // Data State
  const [zones] = useState<Zone[]>(INITIAL_ZONES);
  const [sectors] = useState<Sector[]>(INITIAL_SECTORS);
  const [blocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [panels, setPanels] = useState<Panel[]>(INITIAL_PANELS);

  // Selection State
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Registration Form State
  const [regForm, setRegForm] = useState<Partial<Panel>>({
    name: '',
    serial: '',
    type: '',
    installationDate: new Date().toLocaleDateString('es-PE'),
    row: 1,
    col: 1,
    terminalId: '',
    mac: ''
  });
  const [regError, setRegError] = useState<string | null>(null);

  // Navigation Helpers
  const navigate = (view: View) => {
    setSearchQuery(''); // Reset search on navigation
    setHistory(prev => [...prev, view]);
  };
  
  const goBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const [showPositionModal, setShowPositionModal] = useState(false);

  const resetToHome = () => {
    setHistory(['HOME']);
    setSelectedZone(null);
    setSelectedSector(null);
    setSelectedBlock(null);
    setSelectedPanel(null);
  };

  // Derived Data
  const getSectorsForZone = (zoneId: string) => sectors.filter(s => s.zoneId === zoneId);
  const getBlocksForSector = (sectorId: string) => blocks.filter(b => b.sectorId === sectorId);
  const getPanelsForBlock = (blockId: string) => panels.filter(p => p.blockId === blockId);
  const getAlertsForZone = (zoneId: string) => {
    const zoneSectors = getSectorsForZone(zoneId);
    let count = 0;
    zoneSectors.forEach(s => {
      const sectorBlocks = getBlocksForSector(s.id);
      sectorBlocks.forEach(b => {
        count += getPanelsForBlock(b.id).filter(p => p.status === 'ALERTA' || p.status === 'ERROR').length;
      });
    });
    return count;
  };

  // Components
  const Header = ({ title, showBack = true, subtitle = "" }: { title: string, showBack?: boolean, subtitle?: string }) => (
    <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-4">
          {showBack && (
            <button onClick={goBack} className="p-1 -ml-1 cursor-pointer">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        </div>
        <div className="flex gap-2">
          <div className="w-1 h-4 bg-slate-300 rounded-full" />
          <div className="w-1 h-4 bg-slate-300 rounded-full" />
          <div className="w-1 h-4 bg-slate-300 rounded-full" />
        </div>
      </div>
      {subtitle && (
        <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );

  const BottomNav = () => (
    <div className="bg-white border-t border-slate-100 px-6 py-3 absolute bottom-0 left-0 right-0 flex justify-between items-center z-20">
      <button onClick={resetToHome} className={`flex flex-col items-center gap-1 ${currentView === 'HOME' ? 'text-helio-blue' : 'text-slate-400'}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Inicio</span>
      </button>
      <button onClick={() => navigate('ZONES')} className={`flex flex-col items-center gap-1 ${currentView === 'ZONES' ? 'text-helio-blue' : 'text-slate-400'}`}>
        <div className={currentView === 'ZONES' ? "bg-helio-blue/10 p-2 rounded-xl" : ""}>
          <MapPin className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold">Zonas</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-slate-400 opacity-50 cursor-not-allowed">
        <Bell className="w-6 h-6" />
        <span className="text-[10px] font-medium">Alertas</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-slate-400 opacity-50 cursor-not-allowed">
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium">Perfil</span>
      </button>
    </div>
  );

  const HomeView = () => (
    <div className="pb-24">
      <Header title="Dashboard Principal" showBack={false} />
      <div className="p-6 space-y-6">
        <div className="bg-helio-blue rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium mb-1">Generación Total Hoy</p>
            <h2 className="text-4xl font-black mb-4">12.4 <span className="text-xl font-medium">MWh</span></h2>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1">
                <p className="text-white/60 text-[10px] font-bold uppercase">Zonas</p>
                <p className="text-xl font-black">{zones.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1">
                <p className="text-white/60 text-[10px] font-bold uppercase">Paneles</p>
                <p className="text-xl font-black">{panels.length}</p>
              </div>
            </div>
          </div>
          <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setRegForm({
                name: '', serial: '', type: '', installationDate: new Date().toLocaleDateString('es-PE'),
                row: 1, col: 1, terminalId: '', mac: ''
              });
              navigate('REGISTER_PANEL_1');
            }}
            className="glass-card p-5 flex flex-col items-center text-center gap-3 border-helio-blue/20"
          >
            <div className="w-12 h-12 bg-helio-blue/10 rounded-full flex items-center justify-center text-helio-blue">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">Registrar Panel</p>
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('ZONES')}
            className="glass-card p-5 flex flex-col items-center text-center gap-3 border-helio-green/20"
          >
            <div className="w-12 h-12 bg-helio-green/10 rounded-full flex items-center justify-center text-helio-green">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">Ver Mapa</p>
          </motion.button>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 mb-4">Zonas Recientes</h3>
          <div className="space-y-3">
            {zones.slice(0, 2).map(zone => (
              <div key={zone.id} onClick={() => { setSelectedZone(zone); navigate('SECTORS'); }} className="glass-card p-4 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{zone.name}</p>
                    <p className="text-[10px] text-slate-400">{zone.location}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Views
  const LoginView = () => (
    <div className="min-h-screen bg-helio-blue flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-white rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-helio-orange/10 rounded-full flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-helio-orange rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 mb-1">HelioTrace</h1>
        <p className="text-slate-400 font-medium mb-10">Monitoreo y trazabilidad solar</p>

        <div className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Correo electrónico</label>
            <input 
              type="email" 
              defaultValue="ederq@heliotrace.pe"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Contraseña</label>
            <input 
              type="password" 
              defaultValue="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium"
            />
          </div>
          <button className="text-helio-blue text-sm font-bold w-full text-right pr-2">¿Olvidaste tu contraseña?</button>
          
          <button 
            onClick={() => navigate('HOME')}
            className="btn-primary w-full py-5 text-lg mt-4 shadow-lg shadow-helio-blue/20"
          >
            Iniciar sesión
          </button>
        </div>
      </motion.div>
      
      <div className="mt-10 text-center text-white/60 text-xs font-medium z-10">
        <p>HelioTrace • Monitoreo y trazabilidad solar</p>
        <p>© 2025 HelioTrace. Todos los derechos reservados.</p>
      </div>
    </div>
  );

  const ZonesView = () => (
    <div className="pb-24">
      <Header title="Zonas Geográficas" showBack={false} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-helio-blue/10 rounded-full flex items-center justify-center text-helio-blue font-bold">SA</div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800">Solar Andes S.A.C.</h2>
              <span className="status-badge status-active">Activo</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">RUC 20601234567 · 2 zonas activas</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar zona..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:border-helio-blue outline-none shadow-sm"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-helio-blue text-white p-2 rounded-xl">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {zones.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase())).map(zone => {
            const zoneSectors = getSectorsForZone(zone.id);
            const zoneBlocks = zoneSectors.reduce((acc, s) => acc + getBlocksForSector(s.id).length, 0);
            const zonePanels = zoneSectors.reduce((acc, s) => acc + getBlocksForSector(s.id).reduce((acc2, b) => acc2 + getPanelsForBlock(b.id).length, 0), 0);
            const zoneAlerts = getAlertsForZone(zone.id);

            return (
              <motion.div 
                key={zone.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedZone(zone); navigate('SECTORS'); }}
                className="glass-card p-5 relative cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-helio-blue/5 rounded-full flex items-center justify-center">
                      <Activity className="w-7 h-7 text-helio-blue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{zone.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{zone.location}</p>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">{zone.coords} · {zone.altitude}</p>
                    </div>
                  </div>
                  <span className="status-badge status-active">Activo</span>
                </div>

                <div className="grid grid-cols-4 gap-2 border-t border-slate-50 pt-4">
                  <div className="text-center border-r border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Sectores</p>
                    <p className="text-lg font-black text-slate-800">{zoneSectors.length}</p>
                  </div>
                  <div className="text-center border-r border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Bloques</p>
                    <p className="text-lg font-black text-slate-800">{zoneBlocks}</p>
                  </div>
                  <div className="text-center border-r border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Paneles</p>
                    <p className="text-lg font-black text-slate-800">{zonePanels}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Alertas</p>
                    <p className={`text-lg font-black ${zoneAlerts > 0 ? 'text-helio-red' : 'text-slate-800'}`}>{zoneAlerts}</p>
                  </div>
                </div>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200" />
              </motion.div>
            );
          })}
        </div>

        <button className="btn-primary w-full py-4 text-sm">
          <Plus className="w-5 h-5" />
          Agregar nueva zona geográfica
        </button>
      </div>
    </div>
  );

  const SectorsView = () => (
    <div className="pb-24">
      <Header 
        title="Sectores" 
        subtitle={`Solar Andes > Ica Norte > Sectores`}
      />
      
      <div className="p-6 space-y-6">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-helio-blue/5 rounded-full flex items-center justify-center">
            <Activity className="w-8 h-8 text-helio-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800 text-lg">{selectedZone?.name}</h2>
              <span className="status-badge status-active">Activo</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{selectedZone?.location}</p>
            <p className="text-[10px] text-slate-300 font-mono">{selectedZone?.coords} · {selectedZone?.altitude}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar sector..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:border-helio-blue outline-none shadow-sm"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-helio-blue text-white p-2 rounded-xl">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {getSectorsForZone(selectedZone?.id || '').filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(sector => {
            const sectorBlocks = getBlocksForSector(sector.id);
            const sectorPanels = sectorBlocks.reduce((acc, b) => acc + getPanelsForBlock(b.id).length, 0);
            const sectorCapacity = sectorBlocks.reduce((acc, b) => acc + b.capacity, 0);
            const sectorAlerts = sectorBlocks.reduce((acc, b) => acc + getPanelsForBlock(b.id).filter(p => p.status === 'ALERTA' || p.status === 'ERROR').length, 0);

            return (
              <motion.div 
                key={sector.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedSector(sector); navigate('BLOCKS'); }}
                className="glass-card relative cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-helio-green/5 rounded-full flex items-center justify-center text-helio-green font-black text-2xl">
                        {sector.name.split(' ')[1] || 'S'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{sector.name}</h3>
                        <p className="text-xs text-slate-400 font-medium">{sector.description}</p>
                      </div>
                    </div>
                    <span className="status-badge status-active">Activo</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 border-t border-slate-50 pt-4">
                    <div className="text-center border-r border-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Bloques</p>
                      <p className="text-lg font-black text-slate-800">{sectorBlocks.length}</p>
                    </div>
                    <div className="text-center border-r border-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Cap. total</p>
                      <p className="text-lg font-black text-slate-800">{sectorCapacity}</p>
                    </div>
                    <div className="text-center border-r border-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Registrados</p>
                      <p className="text-lg font-black text-helio-green">{sectorPanels} / {sectorCapacity}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Alertas</p>
                      <p className={`text-lg font-black ${sectorAlerts > 0 ? 'text-helio-red' : 'text-slate-800'}`}>{sectorAlerts}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-helio-green rounded-full" 
                      style={{ width: `${(sectorPanels / (sectorCapacity || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    {Math.round((sectorPanels / (sectorCapacity || 1)) * 100)}% ocupado · {sectorCapacity - sectorPanels} cupos libres
                  </p>
                </div>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200" />
              </motion.div>
            );
          })}
        </div>

        <button className="btn-primary w-full py-4 text-sm">
          <Plus className="w-5 h-5" />
          Agregar nuevo sector
        </button>
      </div>
    </div>
  );

  const BlocksView = () => (
    <div className="pb-24">
      <Header 
        title="Bloques de Instalación" 
        subtitle={`Solar Andes S.A.C. > Ica Norte > Sector A`}
      />
      
      <div className="p-6 space-y-6">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-helio-blue/5 rounded-full flex items-center justify-center border-2 border-helio-blue/20">
            <Battery className="w-8 h-8 text-helio-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800 text-lg">Sector A</h2>
              <span className="status-badge status-active">Activo</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">La Tinguiña, Ica, Ica</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar bloque..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:border-helio-blue outline-none shadow-sm"
            />
          </div>
          <button className="bg-helio-blue text-white px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold">
            <Plus className="w-4 h-4" /> Nuevo bloque
          </button>
        </div>

        <div className="space-y-4">
          {getBlocksForSector(selectedSector?.id || '').filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).map(block => {
            const blockPanels = getPanelsForBlock(block.id);
            return (
              <motion.div 
                key={block.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedBlock(block); navigate('BLOCK_DETAIL'); }}
                className={`glass-card p-5 border-2 transition-all ${selectedBlock?.id === block.id ? 'border-helio-blue shadow-lg' : 'border-transparent'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{block.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{block.type} · {block.power}</p>
                  </div>
                  <span className="status-badge status-active">Operativo</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Capacidad</p>
                    <p className="text-lg font-black text-slate-800">{blockPanels.length} / {block.capacity} paneles</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Cupos libres</p>
                    <p className="text-lg font-black text-helio-green">{block.capacity - blockPanels.length} disponibles</p>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${block.id.includes('1') ? 'bg-helio-green' : 'bg-helio-blue'}`} 
                    style={{ width: `${(blockPanels.length / block.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  {Math.round((blockPanels.length / block.capacity) * 100)}% ocupado
                </p>
              </motion.div>
            );
          })}
        </div>

        <button className="btn-primary w-full py-5 text-lg mt-8 shadow-lg shadow-helio-blue/20">
          <Plus className="w-6 h-6" />
          Agregar nuevo bloque
        </button>
      </div>
    </div>
  );

  const BlockDetailView = () => {
    const blockPanels = getPanelsForBlock(selectedBlock?.id || '');
    const freeSlots = (selectedBlock?.capacity || 0) - blockPanels.length;

    return (
      <div className="pb-24">
        <Header 
          title="Detalle de Bloque" 
          subtitle={`${selectedZone?.name} > ${selectedSector?.name} > ${selectedBlock?.name}`}
        />
        
        <div className="p-6 space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-800">{selectedBlock?.name}</h2>
              <span className="status-badge status-active">Operativo</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="border-r border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Paneles</p>
                <p className="text-xl font-black text-slate-800">{blockPanels.length} / {selectedBlock?.capacity}</p>
              </div>
              <div className="border-r border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Filas × Col.</p>
                <p className="text-xl font-black text-slate-800">3 × 4</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Libres</p>
                <p className="text-xl font-black text-helio-green">{freeSlots}</p>
              </div>
            </div>
            
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-helio-green rounded-full" style={{ width: `${(blockPanels.length / (selectedBlock?.capacity || 1)) * 100}%` }} />
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-4 border-helio-orange/20">
            <div className="w-12 h-12 bg-helio-orange/10 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-helio-orange" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Tipo de panel permitido</p>
              <h3 className="font-bold text-slate-800">{selectedBlock?.type} · {selectedBlock?.power}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Fabricante: SolarTech · Eficiencia: 21.3%</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">Matriz de posiciones del bloque</h3>
            <p className="text-xs text-slate-400 mb-4">3 filas × 4 columnas</p>
            
            <div className="grid grid-cols-4 gap-3">
              {[...Array(12)].map((_, i) => {
                const row = Math.floor(i / 4) + 1;
                const col = (i % 4) + 1;
                const pos = `F${row}C${col}`;
                
                const panelAtPos = blockPanels.find(p => p.row === row && p.col === col);
                const state = panelAtPos ? (panelAtPos.status === 'ALERTA' || panelAtPos.status === 'ERROR' ? 'alert' : 'occupied') : 'free';
                
                return (
                  <motion.div 
                    key={pos}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (panelAtPos) {
                        setSelectedPanel(panelAtPos);
                        navigate('PANEL_DETAIL');
                      } else {
                        // Click on empty cell: start registration with this position
                        setRegForm({
                          ...regForm,
                          blockId: selectedBlock?.id,
                          type: selectedBlock?.type,
                          name: `Panel ${selectedBlock?.name.split(' ')[1]}-${String(blockPanels.length + 1).padStart(3, '0')}`,
                          serial: `SN-${selectedBlock?.name.split(' ')[1]}-${String(blockPanels.length + 1).padStart(3, '0')}`,
                          row,
                          col
                        });
                        navigate('REGISTER_PANEL_1');
                      }
                    }}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all
                      ${state === 'occupied' ? 'bg-helio-green/10 border-helio-green/30 text-helio-green' : 
                        state === 'alert' ? 'bg-helio-orange/10 border-helio-orange/30 text-helio-orange' : 
                        'bg-slate-50 border-slate-100 text-slate-300 hover:border-helio-blue/30 hover:bg-helio-blue/5'}`}
                  >
                    <span className="text-[10px] font-black">{pos}</span>
                    {state === 'occupied' && <CheckCircle2 className="w-4 h-4 mt-1" />}
                    {state === 'alert' && <AlertTriangle className="w-4 h-4 mt-1" />}
                    {state === 'free' && <Plus className="w-3 h-3 mt-1 opacity-0 group-hover:opacity-100" />}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-helio-green/20 border border-helio-green/40" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-helio-orange/20 border border-helio-orange/40" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Alerta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Libre</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setRegForm({
                ...regForm,
                blockId: selectedBlock?.id,
                type: selectedBlock?.type,
                name: `Panel ${selectedBlock?.name.split(' ')[1]}-${String(blockPanels.length + 1).padStart(3, '0')}`,
                serial: `SN-${selectedBlock?.name.split(' ')[1]}-${String(blockPanels.length + 1).padStart(3, '0')}`
              });
              navigate('REGISTER_PANEL_1');
            }}
            className="btn-primary w-full py-5 text-lg mt-4 shadow-lg shadow-helio-blue/20"
          >
            <Plus className="w-6 h-6" />
            Registrar nuevo panel
          </button>
        </div>
      </div>
    );
  };

  const PositionSelectorModal = ({ blockId, onSelect, onClose }: { blockId: string, onSelect: (r: number, c: number) => void, onClose: () => void }) => {
    const block = blocks.find(b => b.id === blockId);
    const blockPanels = getPanelsForBlock(blockId);
    
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
        >
          <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 sm:hidden" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800">Seleccionar Posición</h3>
              <p className="text-xs text-slate-400 font-medium">Matriz de {block?.name}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[...Array(12)].map((_, i) => {
              const row = Math.floor(i / 4) + 1;
              const col = (i % 4) + 1;
              const pos = `F${row}C${col}`;
              const panelAtPos = blockPanels.find(p => p.row === row && p.col === col);
              const isOccupied = !!panelAtPos;
              const isSelected = regForm.row === row && regForm.col === col;

              return (
                <button
                  key={pos}
                  disabled={isOccupied}
                  onClick={() => {
                    onSelect(row, col);
                    onClose();
                  }}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all
                    ${isOccupied ? 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed' : 
                      isSelected ? 'bg-helio-blue border-helio-blue text-white shadow-lg shadow-helio-blue/30' : 
                      'bg-white border-slate-100 text-slate-400 hover:border-helio-blue/30 hover:bg-helio-blue/5'}`}
                >
                  <span className="text-[10px] font-black">{pos}</span>
                  {isOccupied ? <CheckCircle2 className="w-4 h-4 mt-1 opacity-30" /> : isSelected ? <CheckCircle2 className="w-4 h-4 mt-1" /> : <Plus className="w-3 h-3 mt-1" />}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-helio-blue" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border border-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Libre</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const RegisterPanelStep1 = () => {
    const targetBlock = blocks.find(b => b.id === regForm.blockId);
    const blockPanels = getPanelsForBlock(regForm.blockId || '');

    return (
      <div className="pb-24">
        <Header 
          title="Registrar Panel" 
          subtitle={targetBlock ? `${targetBlock.name} > Nuevo panel` : 'Nuevo panel'}
        />
        
        <div className="p-6 space-y-6">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-helio-blue rounded-full w-[33%]" />
          </div>
          <p className="text-helio-blue text-xs font-bold uppercase tracking-wider">Paso 1 de 3</p>

          {targetBlock ? (
            <div className="bg-helio-orange/5 border border-helio-orange/20 rounded-2xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-helio-orange rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Tipo requerido en {targetBlock.name}:</h4>
                <p className="text-sm font-bold text-helio-orange">{targetBlock.type} · {targetBlock.power}</p>
                <p className="text-[10px] text-slate-400 font-medium">El panel a registrar debe coincidir con este tipo.</p>
              </div>
              <button 
                onClick={() => {
                  setRegForm({...regForm, blockId: undefined, type: ''});
                  setRegError(null);
                }}
                className="text-[10px] font-bold text-helio-blue underline uppercase tracking-wider"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Seleccionar Bloque de Destino</label>
              <select 
                value={regForm.blockId || ''}
                onChange={(e) => {
                  const b = blocks.find(bl => bl.id === e.target.value);
                  setRegForm({...regForm, blockId: e.target.value, type: b?.type || ''});
                  setRegError(null);
                }}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium appearance-none"
              >
                <option value="">Seleccione un bloque...</option>
                {blocks.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.type})</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 ml-2">El bloque determina el tipo de panel y la ubicación física.</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Nombre del panel</label>
              <input 
                type="text" 
                value={regForm.name}
                onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                placeholder="Ej: Panel A1-010"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Número de serie</label>
              <input 
                type="text" 
                value={regForm.serial}
                onChange={(e) => setRegForm({...regForm, serial: e.target.value})}
                placeholder="Ej: SN-ICA-A1-0010"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Modelo de Panel Solar</label>
              <input 
                type="text" 
                value={regForm.type}
                onChange={(e) => {
                  setRegForm({...regForm, type: e.target.value});
                  setRegError(null);
                }}
                placeholder="Ej: TP-550W Monocristalino"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium"
              />
              {regError && <p className="text-helio-red text-[10px] font-bold mt-1 ml-2">{regError}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Posición en el bloque</label>
              <button 
                onClick={() => {
                  if (!regForm.blockId) {
                    setRegError("Primero debe seleccionar un bloque de destino.");
                    return;
                  }
                  setShowPositionModal(true);
                }}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-start">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Fila</p>
                    <p className="text-lg text-slate-800 font-black">{regForm.row}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex flex-col items-start">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Columna</p>
                    <p className="text-lg text-slate-800 font-black">{regForm.col}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-helio-blue font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Ver matriz
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
              <p className="text-[10px] text-slate-400 ml-2">Toque para abrir la matriz de posiciones y seleccionar un espacio libre.</p>
            </div>
          </div>

          <button 
            onClick={() => {
              if (!regForm.blockId) {
                setRegError("Debe seleccionar un bloque de destino.");
                return;
              }
              if (!regForm.name?.trim()) {
                setRegError("El nombre del panel es obligatorio.");
                return;
              }
              if (!regForm.serial?.trim()) {
                setRegError("El número de serie es obligatorio.");
                return;
              }
              if (!regForm.type?.trim()) {
                setRegError("El modelo de panel es obligatorio.");
                return;
              }
              
              const b = blocks.find(bl => bl.id === regForm.blockId);
              if (b && b.type !== regForm.type) {
                setRegError(`Incompatibilidad detectada: El bloque ${b.name} requiere paneles tipo "${b.type}". El modelo ingresado (${regForm.type}) no es compatible.`);
                return;
              }

              const isOccupied = blockPanels.some(p => p.row === regForm.row && p.col === regForm.col);
              if (isOccupied) {
                setRegError(`La posición Fila ${regForm.row}, Columna ${regForm.col} ya está ocupada por otro panel.`);
                return;
              }
              
              setRegError(null);
              navigate('REGISTER_PANEL_2');
            }}
            className="btn-primary w-full py-5 text-lg mt-8 shadow-lg shadow-helio-blue/20"
          >
            Siguiente → Vincular Terminal IoT
          </button>
        </div>
        
        <AnimatePresence>
          {showPositionModal && (
            <PositionSelectorModal 
              blockId={regForm.blockId!} 
              onSelect={(r, c) => setRegForm({...regForm, row: r, col: c})}
              onClose={() => setShowPositionModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  };

  const RegisterPanelStep2 = () => (
    <div className="pb-24">
      <Header 
        title="Vincular Terminal IoT" 
        subtitle={`${regForm.name} > Terminal`}
      />
      
      <div className="p-6 space-y-6">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-helio-blue rounded-full w-[66%]" />
        </div>
        <p className="text-helio-blue text-xs font-bold uppercase tracking-wider">Paso 2 de 3</p>

        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Identificador de red (MAC / IMEI / Serial)</label>
            <input 
              type="text" 
              value={regForm.mac}
              onChange={(e) => {
                setRegForm({...regForm, mac: e.target.value, terminalId: `TIO-${e.target.value.split('-').pop()}`});
                setRegError(null);
              }}
              placeholder="Ej: MAC-ICA-A1-10"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-helio-blue outline-none transition-all font-medium"
            />
            {regError && <p className="text-helio-red text-[10px] font-bold mt-1 ml-2">{regError}</p>}
          </div>
          
          <button className="btn-outline w-full py-4">
            <Search className="w-5 h-5" />
            Buscar terminal
          </button>
        </div>

        {regForm.mac && (
          <div className="bg-helio-green/5 border border-helio-green/20 rounded-[32px] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-helio-green rounded-full" />
              <p className="text-xs font-bold text-helio-green">Terminal encontrado y disponible</p>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Cpu className="w-8 h-8 text-helio-green" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Terminal {regForm.terminalId}</h3>
                  <p className="text-xs text-slate-400 font-medium">{regForm.mac}</p>
                </div>
              </div>
              <span className="status-badge status-active">Disponible</span>
            </div>
          </div>
        )}

        <button 
          onClick={() => {
            if (!regForm.mac?.trim()) {
              setRegError("Debe vincular un terminal IoT para continuar.");
              return;
            }
            setRegError(null);
            navigate('REGISTER_PANEL_3');
          }}
          className="btn-primary w-full py-5 text-lg mt-8 shadow-lg shadow-helio-blue/20"
        >
          Asignar terminal y continuar
        </button>
      </div>
    </div>
  );

  const RegisterPanelStep3 = () => {
    const targetBlock = blocks.find(b => b.id === regForm.blockId);
    const targetSector = sectors.find(s => s.id === targetBlock?.sectorId);
    const targetZone = zones.find(z => z.id === targetSector?.zoneId);

    const handleConfirm = () => {
      navigate('REGISTER_LOADING');
      setTimeout(() => {
        const newPanel: Panel = {
          id: `p${panels.length + 1}`,
          blockId: regForm.blockId!,
          name: regForm.name!,
          serial: regForm.serial!,
          type: regForm.type!,
          installationDate: regForm.installationDate!,
          row: regForm.row!,
          col: regForm.col!,
          status: 'OPERATIVO',
          terminalId: regForm.terminalId!,
          mac: regForm.mac!
        };
        setPanels(prev => [...prev, newPanel]);
        setSelectedPanel(newPanel);
        navigate('REGISTER_SUCCESS');
      }, 2000);
    };

    return (
      <div className="pb-24">
        <Header 
          title="Confirmar Registro" 
          subtitle={`${regForm.name} > Confirmación`}
        />
        
        <div className="p-6 space-y-6">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-helio-blue rounded-full w-full" />
          </div>
          <p className="text-helio-blue text-xs font-bold uppercase tracking-wider">Paso 3 de 3</p>

          <div className="glass-card p-5">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Ruta de instalación completa</p>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800">{targetZone?.name}</h4>
              <div className="flex items-start gap-2 ml-4 text-xs text-slate-400 font-medium">
                <div className="w-2 h-2 border-l-2 border-b-2 border-slate-200 mt-1" />
                <p>{targetSector?.name} · {targetBlock?.name}</p>
              </div>
              <div className="flex items-start gap-2 ml-8 text-xs text-helio-blue font-bold">
                <div className="w-2 h-2 border-l-2 border-b-2 border-helio-blue/30 mt-1" />
                <p>Fila {regForm.row} · Columna {regForm.col}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest ml-1">Datos del panel</h3>
            <div className="glass-card p-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nombre</p>
                  <p className="font-black text-slate-800">{regForm.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Serie</p>
                  <p className="font-black text-slate-800">{regForm.serial}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Modelo</p>
                  <p className="font-black text-slate-800">{regForm.type}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleConfirm}
              className="btn-primary w-full py-5 text-lg shadow-lg shadow-helio-blue/20"
            >
              <CheckCircle2 className="w-6 h-6" />
              Confirmar y registrar panel
            </button>
            <button 
              onClick={() => navigate('REGISTER_PANEL_1')}
              className="btn-outline w-full py-5 text-lg bg-white"
            >
              Editar información
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RegisterLoadingView = () => (
    <div className="min-h-screen bg-helio-bg flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 border-4 border-helio-blue/20 border-t-helio-blue rounded-full animate-spin mb-8" />
      <h2 className="text-2xl font-black text-slate-800 mb-2">Procesando Registro</h2>
      <p className="text-slate-500 font-medium">Vinculando panel con terminal IoT y actualizando base de datos...</p>
    </div>
  );

  const RegisterSuccessView = () => (
    <div className="min-h-screen bg-helio-bg flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-helio-green rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center text-center z-10"
      >
        <div className="w-40 h-40 bg-helio-green/10 rounded-full flex items-center justify-center mb-8 relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-28 h-28 bg-helio-green rounded-full flex items-center justify-center shadow-2xl shadow-helio-green/40"
          >
            <CheckCircle2 className="w-16 h-16 text-white" />
          </motion.div>
          
          <div className="absolute inset-0 border-2 border-helio-green/20 rounded-full animate-ping" />
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-4">¡Registro exitoso!</h1>
        <p className="text-slate-500 font-medium max-w-[280px] mb-10">
          Panel y terminal vinculados y listos para monitoreo en tiempo real.
        </p>

        <div className="glass-card p-6 w-full max-w-sm mb-10 text-left">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xl">{selectedPanel?.name}</h3>
              <p className="text-xs text-slate-400 font-medium">Fila {selectedPanel?.row} · Columna {selectedPanel?.col}</p>
              <p className="text-[10px] text-slate-300 font-mono">{selectedPanel?.serial} · {selectedPanel?.type}</p>
            </div>
            <span className="status-badge status-active">Operativo</span>
          </div>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Terminal vinculado:</p>
              <p className="text-sm font-black text-slate-800">{selectedPanel?.terminalId} · {selectedPanel?.mac}</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-helio-green rounded-full" />
              <p className="text-[10px] font-black text-helio-green uppercase">Online</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button 
            onClick={() => navigate('PANEL_DETAIL')}
            className="btn-primary w-full py-5 text-lg shadow-lg shadow-helio-blue/20"
          >
            Ver detalle del panel
          </button>
          <button 
            onClick={() => {
              setRegForm({
                name: '', serial: '', type: '', installationDate: new Date().toLocaleDateString('es-PE'),
                row: 1, col: 1, terminalId: '', mac: ''
              });
              navigate('REGISTER_PANEL_1');
            }}
            className="btn-outline w-full py-5 text-lg bg-white"
          >
            Registrar otro panel
          </button>
          <button 
            onClick={resetToHome}
            className="w-full py-4 text-slate-400 font-bold text-sm"
          >
            Ir al Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );

  const PanelDetailView = () => (
    <div className="pb-24">
      <Header 
        title="Detalle de Panel" 
        subtitle={selectedPanel?.serial}
      />
      
      <div className="p-6 space-y-6">
        <div className="glass-card p-5 relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-2xl">{selectedPanel?.name}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {selectedPanel?.serial} · {selectedPanel?.type}<br />
                Fila {selectedPanel?.row} · Col {selectedPanel?.col} · Inst. {selectedPanel?.installationDate}<br />
                Terminal: {selectedPanel?.terminalId} · {selectedPanel?.mac}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`status-badge ${selectedPanel?.status === 'OPERATIVO' ? 'status-active' : 'status-alert'}`}>
                {selectedPanel?.status}
              </span>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${selectedPanel?.status === 'OPERATIVO' ? 'bg-helio-green/10 text-helio-green border-helio-green/30' : 'bg-helio-orange/10 text-helio-orange border-helio-orange/30'}`}>
                {selectedPanel?.status === 'OPERATIVO' ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Telemetría en tiempo real</h3>
            <span className="text-[10px] text-slate-400 font-medium">hace 2 min</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-helio-blue rounded-full" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Potencia</p>
              </div>
              <p className="text-3xl font-black text-helio-blue">520<span className="text-lg ml-1 font-medium">W</span></p>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-helio-orange rounded-full" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Voltaje</p>
              </div>
              <p className="text-3xl font-black text-helio-orange">40.1<span className="text-lg ml-1 font-medium">V</span></p>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Corriente</p>
              </div>
              <p className="text-3xl font-black text-violet-500">12.8<span className="text-lg ml-1 font-medium">A</span></p>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-helio-red rounded-full" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Temperatura</p>
              </div>
              <p className="text-3xl font-black text-helio-red">42.0<span className="text-lg ml-1 font-medium">°C</span></p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Incidentes recientes</h3>
            <button className="text-[10px] text-helio-blue font-bold uppercase">Ver todos</button>
          </div>
          
          <div className="space-y-3">
            <div className="glass-card p-4 border-l-4 border-l-helio-green">
              <span className="status-badge status-active mb-1">Resuelto</span>
              <h4 className="font-bold text-slate-800">Bajo rendimiento detectado</h4>
              <p className="text-[10px] text-slate-400 font-medium">Potencia 15% por debajo del umbral · Hace 2 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-helio-bg shadow-2xl relative flex flex-col overflow-hidden border-x border-slate-200">
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {currentView === 'LOGIN' && <LoginView />}
            {currentView === 'HOME' && <HomeView />}
            {currentView === 'ZONES' && <ZonesView />}
            {currentView === 'SECTORS' && <SectorsView />}
            {currentView === 'BLOCKS' && <BlocksView />}
            {currentView === 'BLOCK_DETAIL' && <BlockDetailView />}
            {currentView === 'REGISTER_PANEL_1' && <RegisterPanelStep1 />}
            {currentView === 'REGISTER_PANEL_2' && <RegisterPanelStep2 />}
            {currentView === 'REGISTER_PANEL_3' && <RegisterPanelStep3 />}
            {currentView === 'REGISTER_LOADING' && <RegisterLoadingView />}
            {currentView === 'REGISTER_SUCCESS' && <RegisterSuccessView />}
            {currentView === 'PANEL_DETAIL' && <PanelDetailView />}
          </motion.div>
        </AnimatePresence>
      </div>
      {currentView !== 'LOGIN' && <BottomNav />}
    </div>
  );
}
