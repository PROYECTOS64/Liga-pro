'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Key, Check } from 'lucide-react';

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('arbitro');
  const [club, setClub] = useState(''); // Solo para delegado de club
  const [credencialGenerada, setCredencialGenerada] = useState<any>(null);

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('mock_users') || '[]');
    setUsuarios(guardados);
  }, []);

  const generarPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const crearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;
    
    // Generar username basado en nombre (ej. juan_perez)
    const baseUsername = nombre.toLowerCase().trim().replace(/\s+/g, '_');
    const username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
    const password = generarPassword();

    const nuevoUsuario = {
      id: Date.now().toString(),
      name: nombre,
      username,
      password,
      role: rol,
      club: rol === 'club' ? club : undefined,
      fechaCreacion: new Date().toISOString()
    };

    const nuevosUsuarios = [...usuarios, nuevoUsuario];
    setUsuarios(nuevosUsuarios);
    localStorage.setItem('mock_users', JSON.stringify(nuevosUsuarios));
    
    setCredencialGenerada(nuevoUsuario);
    setNombre('');
    setClub('');
  };

  const eliminarUsuario = (id: string) => {
    if (confirm('¿Eliminar este usuario del sistema?')) {
      const nuevosUsuarios = usuarios.filter(u => u.id !== id);
      setUsuarios(nuevosUsuarios);
      localStorage.setItem('mock_users', JSON.stringify(nuevosUsuarios));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Gestión de Usuarios Especiales
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Crea cuentas de acceso para Árbitros y Delegados de Club.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-xl border" style={{ background: 'var(--fondo-tarjeta)', borderColor: 'var(--borde-suave)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--texto-primario)' }}>Crear Nuevo Usuario</h3>
            <form onSubmit={crearUsuario} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Nombre Completo</label>
                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2980B9]/30" placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Rol</label>
                <select value={rol} onChange={e => setRol(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#2980B9]/30">
                  <option value="arbitro">Árbitro</option>
                  <option value="club">Delegado de Club</option>
                </select>
              </div>
              {rol === 'club' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Club Asignado</label>
                  <input required type="text" value={club} onChange={e => setClub(e.target.value)} className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2980B9]/30" placeholder="Ej. Barcelona SC" />
                </div>
              )}
              <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 mt-2" style={{ background: '#2980B9' }}>
                <UserPlus size={16} /> Generar Usuario
              </button>
            </form>

            {credencialGenerada && (
              <div className="mt-6 p-4 border rounded-lg" style={{ background: '#EBF5FF', borderColor: '#2980B9' }}>
                <div className="flex items-center gap-2 mb-2 text-[#0369A1]">
                  <Check size={18} />
                  <span className="font-semibold text-sm">¡Usuario Creado!</span>
                </div>
                <p className="text-xs mb-3 text-[#0284C7]">Copia estas credenciales y entrégalas al usuario. <strong>La contraseña no se volverá a mostrar.</strong></p>
                <div className="bg-white p-3 rounded text-sm space-y-2 border shadow-sm">
                  <p><strong>Rol:</strong> {credencialGenerada.role}</p>
                  <p><strong>Usuario:</strong> {credencialGenerada.username}</p>
                  <p><strong>Contraseña:</strong> <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border">{credencialGenerada.password}</span></p>
                  {credencialGenerada.club && <p><strong>Club:</strong> {credencialGenerada.club}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-5 rounded-xl border bg-white h-full" style={{ borderColor: 'var(--borde-suave)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--texto-primario)' }}>Usuarios Registrados</h3>
            {usuarios.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                <Users size={32} className="mx-auto mb-2 text-gray-300" />
                No hay usuarios especiales creados.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="p-3 font-semibold text-gray-600">Nombre</th>
                      <th className="p-3 font-semibold text-gray-600">Usuario</th>
                      <th className="p-3 font-semibold text-gray-600">Rol</th>
                      <th className="p-3 text-center font-semibold text-gray-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50 last:border-0">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{u.name}</div>
                          {u.club && <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {u.club}</div>}
                        </td>
                        <td className="p-3 font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block mt-3 ml-3 border text-xs">{u.username}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'arbitro' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                            {u.role === 'arbitro' ? 'Árbitro' : 'Delegado de Club'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => eliminarUsuario(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors inline-block">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
