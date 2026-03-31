import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import SearchBar from '@/Components/SearchBar';
import { EmptyState } from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
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
                <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Edit Client' : 'Add New Client'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={data.client_name}
                                    onChange={(e) => setData('client_name', e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Enter client name"
                                    required
                                />
                            </div>
                            {errors.client_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.client_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="client@example.com"
                                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={data.mobile_no1}
                                        onChange={(e) => setData('mobile_no1', e.target.value)}
                                        className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="+233 XX XXX XXXX"
                                        required
                                    />
                                </div>
                                {errors.mobile_no1 && (
                                    <p className="mt-1 text-sm text-red-600">{errors.mobile_no1}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alt. Phone
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={data.mobile_no2}
                                        onChange={(e) => setData('mobile_no2', e.target.value)}
                                        className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="+233 XX XXX XXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delivery Address *
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                </div>
                                <textarea
                                    value={data.delivery_address}
                                    onChange={(e) => setData('delivery_address', e.target.value)}
                                    rows={3}
                                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Enter delivery address"
                                    required
                                />
                            </div>
                            {errors.delivery_address && (
                                <p className="mt-1 text-sm text-red-600">{errors.delivery_address}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {editingClient ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingClient ? 'Update Client' : 'Create Client'
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
