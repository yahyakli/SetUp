<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamMember extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'team_id',
        'user_id',
        'role',
        'joined_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'joined_at' => 'datetime',
    ];

    /**
     * Get the team that owns the team member.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get all projects associated with this member's team.
     */
    public function getProjectsAttribute()
    {
        return $this->team->projects;
    }

    /**
     * Check if this member is an owner.
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Check if this member is a leader.
     */
    public function isLeader(): bool
    {
        return $this->role === 'leader';
    }

    /**
     * Check if this member is a manager.
     */
    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    /**
     * Check if this member is a developer.
     */
    public function isDeveloper(): bool
    {
        return $this->role === 'developer';
    }

    /**
     * Check if this member is a tester.
     */
    public function isTester(): bool
    {
        return $this->role === 'tester';
    }

    /**
     * Check if this member is a designer.
     */
    public function isDesigner(): bool
    {
        return $this->role === 'designer';
    }
    
    /**
     * Get the duration of membership in days.
     */
    public function getMembershipDurationAttribute()
    {
        return $this->joined_at->diffInDays(now());
    }
}