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
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  FunnelIcon,
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
  }
  specialties: Specialty[]
  primary_specialty: string
  qualifications: string
  experience_years: number
  clinic_name: string
  clinic_address: string
  city: string
  consultation_fee: string
  average_rating: number
  total_reviews: number
  is_available_today: boolean
  profile_image?: string
}

export default function Doctors() {
  const [search, setSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
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
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find a Doctor
          </h1>
          <p className="text-gray-600">
            Choose from our network of verified healthcare professionals
          </p>
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-4 mb-8"
        >
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Search doctors by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            
            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Cities</option>
              <option value="delhi">Delhi</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
              <option value="chennai">Chennai</option>
            </select>
            
            {/* Mobile Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
              leftIcon={<FunnelIcon className="w-5 h-5" />}
            >
              Filters
            </Button>
          </div>
        </motion.div>
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
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
            <p className="text-gray-500">
              No doctors found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor: Doctor, index: number) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="hover"
                  className="h-full flex flex-col"
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {doctor.profile_image ? (
                        <img
                          src={doctor.profile_image}
                          alt={doctor.user.full_name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl gradient-bg flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {doctor.user.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        Dr. {doctor.user.full_name}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium">
                        {doctor.primary_specialty}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {doctor.qualifications}
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
                        <span className="text-sm text-gray-600 ml-1">
                          ({doctor.total_reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="mt-4 space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{doctor.experience_years} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">
                        {doctor.clinic_name}, {doctor.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CurrencyRupeeIcon className="w-4 h-4" />
                      <span>₹{doctor.consultation_fee} consultation</span>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      {doctor.is_available_today ? (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          Available Today
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Next available tomorrow
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
