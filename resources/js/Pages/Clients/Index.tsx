import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import SearchBar from '@/Components/SearchBar';
import { EmptyState } from '@/Components/EmptyState';
import Swal from 'sweetalert2';
import { Phone, Mail, MapPin, Plus, Users, Pencil, Trash2 } from 'lucide-react';

interface Client {
    id: number;
    client_name: string;
    email: string | null;
    mobile_no1: string;
    mobile_no2: string | null;
    delivery_address: string;
    created_at: string;
}

interface Props {
    clients: Client[];
}

const SkeletonClientCard = () => (
    <div className="glass-card-hover p-5 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-100 rounded" />
            </div>
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-4 w-48 bg-gray-100 rounded" />
            <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-white/20">
            <div className="h-9 w-full bg-gray-100 rounded-lg" />
            <div className="h-9 w-full bg-gray-100 rounded-lg" />
        </div>
    </div>
);

export default function Index({ clients }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClients = clients.filter(client => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            client.client_name.toLowerCase().includes(query) ||
            client.email?.toLowerCase().includes(query) ||
            client.mobile_no1?.toLowerCase().includes(query) ||
            client.mobile_no2?.toLowerCase().includes(query) ||
            client.delivery_address?.toLowerCase().includes(query)
        );
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        client_name: '',
        email: '',
        mobile_no1: '',
        mobile_no2: '',
        delivery_address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClient) {
            put(route('clients.update', editingClient.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                    reset();
                },
            });
        } else {
            post(route('clients.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setData({
            client_name: client.client_name,
            email: client.email || '',
            mobile_no1: client.mobile_no1,
            mobile_no2: client.mobile_no2 || '',
            delivery_address: client.delivery_address,
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingClient(null);
        reset();
        setIsModalOpen(true);
    };

    const deleteClient = (id: number) => {
        Swal.fire({
            title: 'Delete Client?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = route('clients.destroy', id);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Clients" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your client directory</p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus size={18} />
                        Add Client
                    </Button>
                </div>

                {/* Stats */}
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-accent-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{clients.length}</p>
                        <p className="text-sm text-gray-500">Total Clients</p>
                    </div>
                </div>

                {/* Search */}
                <div className="w-full">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search clients by name, email, phone, or address..."
                        className="w-full"
                    />
                </div>

                {/* Client Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                        <div 
                            key={client.id} 
                            className="glass-card-hover p-5 group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/25">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-800 truncate">{client.client_name}</h3>
                                    {client.email && (
                                        <p className="text-sm text-gray-500 truncate">{client.email}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-4 h-4 text-accent-500 flex-shrink-0" />
                                    <span className="truncate">{client.mobile_no1}</span>
                                </div>
                                {client.mobile_no2 && (
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{client.mobile_no2}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="w-4 h-4 text-accent-500 flex-shrink-0" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 text-gray-600">
                                    <MapPin className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{client.delivery_address}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-3 border-t border-white/20">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 hover:bg-amber-50 hover:text-amber-600"
                                    onClick={() => openEditModal(client)}
                                >
                                    <Pencil className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 hover:bg-red-50 hover:text-red-600 text-red-500"
                                    onClick={() => deleteClient(client.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredClients.length === 0 && (
                    <EmptyState
                        variant="clients"
                        className="glass-card"
                        onAction={openCreateModal}
                        description={searchQuery ? "No clients match your search criteria. Try adjusting your search terms." : undefined}
                    />
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-modal-content w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingClient ? 'Edit Client' : 'Add Client'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="client_name">Client Name</Label>
                                <Input
                                    id="client_name"
                                    value={data.client_name}
                                    onChange={(e) => setData('client_name', e.target.value)}
                                    className="glass-input"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="mobile_no1">Mobile No 1</Label>
                                <Input
                                    id="mobile_no1"
                                    value={data.mobile_no1}
                                    onChange={(e) => setData('mobile_no1', e.target.value)}
                                    className="glass-input"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="mobile_no2">Mobile No 2</Label>
                                <Input
                                    id="mobile_no2"
                                    value={data.mobile_no2}
                                    onChange={(e) => setData('mobile_no2', e.target.value)}
                                    className="glass-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="glass-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="delivery_address">Delivery Address</Label>
                                <Input
                                    id="delivery_address"
                                    value={data.delivery_address}
                                    onChange={(e) => setData('delivery_address', e.target.value)}
                                    className="glass-input"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {editingClient ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
