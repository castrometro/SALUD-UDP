import React from 'react'
import { ChevronRight } from 'lucide-react'

interface CardProps {
  title: string;
  text: string;
  link: string;
}

export default function Card({ title, text, link }: CardProps) {
  return (
    <div className="py-14">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <h2 className="font-arizona font-medium text-4xl mb-4 md:mb-0 md:w-1/3">{title}</h2>
          <div className="md:w-2/3">
            <p className="font-worksans font-regular text-lg mb-4">{text}</p>
            <div className="flex justify-end">
              <a 
                href={link} 
                className="inline-flex items-center font-worksans font-medium text-lg text-aqua hover:text-blue-800 transition-colors duration-200"
              >
                ver más información
                <ChevronRight className="ml-1 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8">
        <hr className="border-t-2 border-black"/>
      </div>
    </div>
  )
}
