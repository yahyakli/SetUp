<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::where('is_active', true)->get();
        return response()->json(['plans' => $plans]);
    }

    public function show($id)
    {
        $plan = Plan::findOrFail($id);
        return response()->json(['plan' => $plan]);
    }

    // Admin methods for CRUD operations
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,quarterly,yearly',
            'features' => 'required|json',
            'is_active' => 'boolean',
        ]);

        $plan = Plan::create($validated);
        return response()->json(['plan' => $plan], 201);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'billing_cycle' => 'in:monthly,quarterly,yearly',
            'features' => 'json',
            'is_active' => 'boolean',
        ]);

        $plan->update($validated);
        return response()->json(['plan' => $plan]);
    }

    public function destroy($id)
    {
        $plan = Plan::findOrFail($id);
        $plan->delete();
        return response()->json(null, 204);
    }
}