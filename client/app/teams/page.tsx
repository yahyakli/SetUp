"use client"

import React, { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Search,
  Filter
} from 'lucide-react'
import AppLayout from '../AppLayout'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'


export default function Page() {
  const { teams, teamLoading } = useSelector((state: RootState) => state.teams);
  const [searchTerm, setSearchTerm] = useState('')
  const [memberCountFilter, setMemberCountFilter] = useState('All')


  // Filtered and Searched Teams
  const filteredTeams = useMemo(() => {
    if (!teams) return [];

    return teams.filter(team => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase())

      let matchesMemberCount = true
      if (memberCountFilter === 'Small') {
        matchesMemberCount = team.members.length < 3
      } else if (memberCountFilter === 'Medium') {
        matchesMemberCount = team.members.length >= 3 && team.members.length <= 5
      } else if (memberCountFilter === 'Large') {
        matchesMemberCount = team.members.length > 5
      }

      return matchesSearch && matchesMemberCount
    })
  }, [searchTerm, memberCountFilter, teams]);

  // Skeleton loader component for team cards
  const TeamCardSkeleton = () => (
    <Card className="dark:bg-gray-800 dark:border-gray-700 h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">Teams</h1>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search teams..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={teamLoading}
            />
          </div>

          <Select
            value={memberCountFilter}
            onValueChange={(value) => setMemberCountFilter(value)}
            disabled={teamLoading}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Team Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sizes</SelectItem>
              <SelectItem value="Small">Small (1-2)</SelectItem>
              <SelectItem value="Medium">Medium (3-5)</SelectItem>
              <SelectItem value="Large">Large (6+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skeleton Loader or Teams Grid */}
        {teamLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <TeamCardSkeleton key={index} />
            ))}
          </div>
        ) : !teams || teams.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No teams found. You are not a member of any team yet.
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No teams found matching your search and filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card
                  className="hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 h-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex-grow pr-4">
                      <CardTitle className="text-lg font-bold truncate">
                        {team.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {team.description}
                      </CardDescription>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="default">
                        {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}