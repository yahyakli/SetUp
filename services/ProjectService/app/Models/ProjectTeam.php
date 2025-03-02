<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTeam extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'team_id',
    ];

    /**
     * Get the project that the team is assigned to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the team that is assigned to the project.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
    
    /**
     * Get all team members associated with this project-team relationship.
     */
    public function getTeamMembersAttribute()
    {
        return $this->team->members;
    }
}