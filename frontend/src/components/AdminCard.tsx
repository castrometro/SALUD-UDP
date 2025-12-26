import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminCardProps {
  title: string;
  link: string;
}

export const AdminCard = ({ title, link }: AdminCardProps) => (
  <div className="bg-white rounded-lg shadow-md p-12 flex flex-col justify-between border border-black">
    <h2 className="font-worksans font-semibold text-2xl mb-4 ">{title}</h2>
    <Link 
      to={link} 
      className="text-black-600 hover:text-blue-800 flex items-center justify-end"
    >
      acceso
      <ChevronRight className="ml-1 h-5 w-5 text-aqua" />
    </Link>
  </div>
);
