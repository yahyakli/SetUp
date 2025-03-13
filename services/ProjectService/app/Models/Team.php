<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the team members for the team.
     */
    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    /**
     * Get the projects associated with the team.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_teams')
            ->withTimestamps();
    }

    /**
     * Get the owners of the team.
     */
    public function owners()
    {
        return $this->members()->where('role', 'owner');
    }

    /**
     * Get the leaders of the team.
     */
    public function leaders()
    {
        return $this->members()->where('role', 'leader');
    }

    /**
     * Get the developers of the team.
     */
    public function developers()
    {
        return $this->members()->where('role', 'developer');
    }

    /**
     * Check if a user is a member of the team.
     * 
     * @param string $userId
     * @return bool
     */
    public function hasMember(string $userId): bool
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    /**
     * Get a team member by user ID.
     * 
     * @param string $userId
     * @return TeamMember|null
     */
    public function getMember(string $userId)
    {
        return $this->members()->where('user_id', $userId)->first();
    }

    /**
     * Get the count of members in this team.
     */
    public function getMemberCountAttribute()
    {
        return $this->members()->count();
    }
}
