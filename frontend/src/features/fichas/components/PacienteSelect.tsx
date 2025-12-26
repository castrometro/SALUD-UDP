import React, { useState, useEffect, useRef } from 'react';
import { Paciente } from '../../pacientes/types';
import { getPacientes } from '../../pacientes/services/pacienteService';

interface PacienteSelectProps {
    value?: number; // ID
    onChange: (id: number | undefined) => void;
    disabled?: boolean;
}

const PacienteSelect: React.FC<PacienteSelectProps> = ({ value, onChange, disabled }) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Cargar todos los pacientes inicialmente (para MVP, luego optimizar con búsqueda en backend)
    // TODO: Implementar búsqueda en backend para escalar
    useEffect(() => {
        const fetchPacientes = async () => {
            setLoading(true);
            try {
                const data = await getPacientes();
                setOptions(data);
                if (value) {
                    const found = data.find(p => p.id === value);
                    if (found) setSelectedPaciente(found);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPacientes();
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(p => 
        p.nombre.toLowerCase().includes(query.toLowerCase()) || 
        p.apellido.toLowerCase().includes(query.toLowerCase()) ||
        p.rut.includes(query)
    );

    const handleSelect = (paciente: Paciente) => {
        setSelectedPaciente(paciente);
        onChange(paciente.id);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={selectedPaciente ? `${selectedPaciente.nombre} ${selectedPaciente.apellido} (${selectedPaciente.rut})` : "Buscar paciente..."}
                    value={isOpen ? query : (selectedPaciente ? `${selectedPaciente.nombre} ${selectedPaciente.apellido} (${selectedPaciente.rut})` : '')}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                />
                {selectedPaciente && !isOpen && !disabled && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPaciente(null);
                            onChange(undefined);
                            setQuery('');
                        }}
                    >
                        <span className="text-lg">&times;</span>
                    </button>
                )}
            </div>

            {isOpen && !disabled && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {loading ? (
                        <li className="text-gray-500 cursor-default select-none relative py-2 pl-3 pr-9">Cargando...</li>
                    ) : filteredOptions.length === 0 ? (
                        <li className="text-gray-500 cursor-default select-none relative py-2 pl-3 pr-9">No se encontraron resultados</li>
                    ) : (
                        filteredOptions.map((paciente) => (
                            <li
                                key={paciente.id}
                                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                                onClick={() => handleSelect(paciente)}
                            >
                                <span className="block truncate">
                                    {paciente.nombre} {paciente.apellido} - {paciente.rut}
                                </span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default PacienteSelect;
