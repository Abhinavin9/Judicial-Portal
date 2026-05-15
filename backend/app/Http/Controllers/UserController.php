<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,court_admin,judge,lawyer,clerk,client,police',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'bar_number' => 'nullable|string',
            'court_id' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'bar_number' => $validated['bar_number'] ?? null,
            'court_id' => $validated['court_id'] ?? null,
        ]);
        Cache::flush();

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|in:super_admin,court_admin,judge,lawyer,clerk,client,police',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'bar_number' => 'nullable|string',
            'court_id' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        Cache::flush();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        Cache::flush();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    public function judges()
    {
        $judges = User::where('role', 'judge')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        return response()->json($judges);
    }

    public function lawyers()
    {
        $lawyers = User::where('role', 'lawyer')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone', 'bar_number')
            ->get();

        return response()->json($lawyers);
    }

    public function clients()
    {
        $clients = User::where('role', 'client')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        return response()->json($clients);
    }

    public function police()
    {
        $police = User::where('role', 'police')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        return response()->json($police);
    }
}
