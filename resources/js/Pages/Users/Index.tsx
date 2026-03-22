import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import SearchBar from '@/Components/SearchBar';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    client_id: number | null;
    client_name: string | null;
    created_at: string;
}

interface Client {
    id: number;
    client_name: string;
}

interface Props {
    users: User[];
    clients?: Client[];
}

const ROLE_COLORS: Record<string, string> = {
    manager: 'bg-purple-100 text-purple-800',
    sales_rep: 'bg-blue-100 text-blue-800',
    client: 'bg-green-100 text-green-800',
};

export default function Index({ users, clients = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
        );
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'sales_rep' as string,
        client_id: '' as string,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            ...data,
            client_id: data.role === 'client' ? data.client_id : null,
        };

        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    reset();
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            client_id: user.client_id?.toString() || '',
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setData({
            name: '',
            email: '',
            password: '',
            role: 'sales_rep',
            client_id: '',
        });
        setIsModalOpen(true);
    };

    const deleteUser = (id: number) => {
        Swal.fire({
            title: 'Delete User?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = route('users.destroy', id);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Users" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">User Management</h1>
                <div className="flex items-center justify-between mb-6">
                    <Button onClick={openCreateModal}>Add User</Button>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search users..."
                    />
                </div>

                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white rounded-lg border p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{user.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs ${ROLE_COLORS[user.role] || 'bg-gray-100'}`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                <p>{user.email}</p>
                                {user.client_name && <p>Client: {user.client_name}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => openEditModal(user)} className="flex-1">
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)} className="flex-1">
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Client</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${ROLE_COLORS[user.role] || 'bg-gray-100'}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{user.client_name || '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {searchQuery ? 'No users match your search.' : 'No users found. Add your first user!'}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingUser ? 'Edit User' : 'Add User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">
                                    Password {editingUser && '(leave blank to keep current)'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required={!editingUser}
                                    minLength={8}
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="manager">Manager</option>
                                    <option value="sales_rep">Sales Rep</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>
                            {data.role === 'client' && (
                                <div>
                                    <Label htmlFor="client_id">Associated Client</Label>
                                    <select
                                        id="client_id"
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                    >
                                        <option value="">Select a client</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.client_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-2 justify-end pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {editingUser ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
