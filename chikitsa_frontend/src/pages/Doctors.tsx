/**
 * Doctors listing page with search and filters.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { doctorsAPI } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface Specialty {
  id: number
  name: string
  slug: string
  icon: string
}

interface Doctor {
  id: string
  user: {
    id: string
    full_name: string
    email: string
    avatar?: string
  }
  specialty: {
    id: number
    name: string
    slug: string
  }
  years_of_experience: number
  clinic_name: string
  clinic_city: string
  consultation_fee: string
  average_rating: number
  total_reviews: number
  is_accepting_patients: boolean
  languages: string
}

export default function Doctors() {
  usePageTitle('Find Doctors')
  const [search, setSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  
  // Fetch specialties
  const { data: specialtiesData } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => doctorsAPI.getSpecialties(),
  })
  
  // Fetch doctors
  const { data: doctorsData, isLoading, error } = useQuery({
    queryKey: ['doctors', search, selectedSpecialty, selectedCity],
    queryFn: () =>
      doctorsAPI.getDoctors({
        search,
        specialty: selectedSpecialty,
        city: selectedCity,
      }),
  })
  
  const specialties = specialtiesData?.data || []
  const doctors = doctorsData?.data?.results || []
  
  if (isLoading) return <PageLoading />
  
  return (
    <div className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find a Doctor
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose from our network of verified healthcare professionals
          </p>
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-sm border border-white/40 dark:border-slate-700 p-4 mb-8"
        >
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0 sm:min-w-[250px]">
              <Input
                placeholder="Search doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            
            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm"
            >
              <option value="">All Specialties</option>
              {specialties.map((spec: Specialty) => (
                <option key={spec.id} value={spec.slug}>
                  {spec.name}
                </option>
              ))}
            </select>
            
            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm"
            >
              <option value="">All Cities</option>
              <option value="delhi">Delhi</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
              <option value="chennai">Chennai</option>
            </select>
          </div>
        </motion.div>
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing <span className="font-semibold">{doctors.length}</span>{' '}
            doctors
          </p>
        </div>
        
        {/* Doctors Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500">
              Failed to load doctors. Please try again.
            </p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No doctors found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {doctors.map((doctor: Doctor, index: number) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="hover"
                  className="h-full flex flex-col bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-slate-700"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {doctor.user?.avatar ? (
                        <img
                          src={doctor.user.avatar}
                          alt={doctor.user.full_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl gradient-bg flex items-center justify-center">
                          <span className="text-white text-xl sm:text-2xl font-bold">
                            {doctor.user.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        Dr. {doctor.user.full_name}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium">
                        {doctor.specialty?.name}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>
                            {star <= Math.round(doctor.average_rating) ? (
                              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <StarIcon className="w-4 h-4 text-gray-300" />
                            )}
                          </span>
                        ))}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          ({doctor.total_reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="mt-4 space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <ClockIcon className="w-4 h-4" />
                      <span>{doctor.years_of_experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">
                        {doctor.clinic_name}, {doctor.clinic_city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CurrencyRupeeIcon className="w-4 h-4" />
                      <span>₹{doctor.consultation_fee} consultation</span>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-slate-700">
                    <div>
                      {doctor.is_accepting_patients ? (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          Accepting Patients
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Not accepting patients
                        </span>
                      )}
                    </div>
                    <Link to={`/doctors/${doctor.id}`}>
                      <Button size="sm">View Profile</Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
