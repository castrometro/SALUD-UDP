import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="w-1/3 flex justify-start">
            <img 
              src="/images/udp-en-linea-logo.png" 
              alt="UDP en línea" 
              className="h-12 object-contain"
            />
          </div>
          <div className="w-1/3 flex">
            <img 
              src="/images/late-logo.png" 
              alt="Laboratorio en Tecnologías Educativas" 
              className="h-16 object-contain"
            />
          </div>
          <div className="w-1/3 flex justify-end">
            <img 
              src="/images/udp-acreditacion.png" 
              alt="Universidad Diego Portales Acreditada" 
              className="h-20 object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
