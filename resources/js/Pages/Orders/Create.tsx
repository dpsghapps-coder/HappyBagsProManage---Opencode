import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { X, Plus, Search } from 'lucide-react';

interface Client {
    id: number;
    client_name: string;
}

interface Product {
    id: number;
    product_name: string;
    unit_price: number;
    category: string;
}

interface Props {
    clients: Client[];
    products: Product[];
}

interface OrderItem {
    product_id: number;
    qty: number;
    discount: number;
    discount_type: 'percentage' | 'value';
}

export default function Create({ clients, products }: Props) {
    const [items, setItems] = useState<OrderItem[]>([{ product_id: 0, qty: 1, discount: 0, discount_type: 'percentage' }]);
    const [clientSearch, setClientSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [clientList, setClientList] = useState(clients);
    const clientDropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        items: [] as OrderItem[],
        is_vat: false,
        delivery_date: '',
        delivery_time: '09:00',
    });

    // Sync items to form data whenever items change
    useEffect(() => {
        setData('items', items);
    }, [items]);

    // Update client list when props change
    useEffect(() => {
        setClientList(clients);
    }, [clients]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
                setShowClientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredClients = clientList.filter(client =>
        client.client_name.toLowerCase().includes(clientSearch.toLowerCase())
    );

    const selectClient = (clientId: number, clientName: string) => {
        setData('client_id', clientId.toString());
        setClientSearch(clientName);
        setShowClientDropdown(false);
    };

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') || '' : '';
    };

    const handleCreateClient = () => {
        Swal.fire({
            title: 'Create New Client',
            html: `
                <input id="swal-client-name" class="swal2-input" placeholder="Client Name *" style="width: 90%;">
                <input id="swal-email" class="swal2-input" placeholder="Email" style="width: 90%;">
                <input id="swal-mobile1" class="swal2-input" placeholder="Mobile No 1 *" style="width: 90%;">
                <input id="swal-mobile2" class="swal2-input" placeholder="Mobile No 2" style="width: 90%;">
                <textarea id="swal-address" class="swal2-textarea" placeholder="Delivery Address" style="width: 90%;"></textarea>
            `,
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Create',
            preConfirm: () => {
                const clientName = (document.getElementById('swal-client-name') as HTMLInputElement).value;
                const email = (document.getElementById('swal-email') as HTMLInputElement).value;
                const mobile1 = (document.getElementById('swal-mobile1') as HTMLInputElement).value;
                const mobile2 = (document.getElementById('swal-mobile2') as HTMLInputElement).value;
                const address = (document.getElementById('swal-address') as HTMLTextAreaElement).value;

                if (!clientName || !mobile1) {
                    Swal.showValidationMessage('Client Name and Mobile No 1 are required');
                    return false;
                }

                return { client_name: clientName, email, mobile_no1: mobile1, mobile_no2: mobile2, delivery_address: address };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                fetch('/clients', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(result.value),
                })
                .then(res => res.json())
                .then(data => {
                    if (data.id) {
                        const newClient = { id: data.id, client_name: data.client_name };
                        setClientList([...clientList, newClient]);
                        selectClient(data.id, data.client_name);
                        Swal.fire('Success', 'Client created successfully!', 'success');
                    }
                })
                .catch(err => {
                    Swal.fire('Error', 'Failed to create client.', 'error');
                });
            }
        });
    };

    const addItem = () => {
        setItems([...items, { product_id: 0, qty: 1, discount: 0, discount_type: 'percentage' }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const updateItem = (index: number, field: 'product_id' | 'qty' | 'discount' | 'discount_type', value: number | string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotal = () => {
        let subtotal = 0;
        items.forEach((item) => {
            const product = products.find((p) => p.id === item.product_id);
            if (product) {
                let lineTotal = product.unit_price * item.qty;
                if (item.discount_type === 'percentage') {
                    lineTotal = lineTotal - (lineTotal * item.discount / 100);
                } else {
                    lineTotal = lineTotal - item.discount;
                }
                subtotal += lineTotal;
            }
        });
        const vat = data.is_vat ? subtotal * 0.20 : 0;
        return { subtotal, vat, total: subtotal + vat };
    };

    const { subtotal, vat, total } = calculateTotal();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = items.filter((item) => item.product_id > 0);
        if (validItems.length === 0) {
            alert('Please select at least one product');
            return;
        }
        
        const deliveryDateTime = `${data.delivery_date} ${data.delivery_time}:00`;
        setData('items', validItems);
        setData('delivery_date', deliveryDateTime);
        post(route('orders.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Order" />

            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Create New Order</h1>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base md:text-lg">Client Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative" ref={clientDropdownRef}>
                                <Label htmlFor="client_id" className="text-sm">Select Client</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setShowClientDropdown(true);
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        placeholder="Search for a client..."
                                        className="w-full h-12 md:h-10 pl-10 pr-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    {clientSearch && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setClientSearch('');
                                                setData('client_id', '');
                                            }}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                
                                {showClientDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
                                            <button
                                                type="button"
                                                onClick={handleCreateClient}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create New Client
                                            </button>
                                        </div>
                                        
                                        {filteredClients.length === 0 ? (
                                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                                No clients found
                                            </div>
                                        ) : (
                                            filteredClients.map((client) => (
                                                <button
                                                    key={client.id}
                                                    type="button"
                                                    onClick={() => selectClient(client.id, client.client_name)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                                                >
                                                    {client.client_name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base md:text-lg">Order Items</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8">
                                <Plus className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Add Item</span>
                                <span className="sm:inline">Add</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Desktop Header Row */}
                            <div className="hidden md:flex items-center text-sm font-medium text-gray-600 px-2 gap-4">
                                <div className="flex-1">Product</div>
                                <div className="w-20 text-center">Qty</div>
                                <div className="w-40 flex items-center gap-1">
                                    <span className="w-16">Discount</span>
                                    <span className="w-16">Type</span>
                                </div>
                                <div className="w-24 text-right">Total</div>
                                <div className="w-10"></div>
                            </div>
                            
                            {items.map((item, index) => {
                                const product = products.find((p) => p.id === item.product_id);
                                const unitPrice = product?.unit_price || 0;
                                let lineTotal = unitPrice * item.qty;
                                if (item.discount_type === 'percentage') {
                                    lineTotal = lineTotal - (lineTotal * item.discount / 100);
                                } else {
                                    lineTotal = lineTotal - item.discount;
                                }
                                
                                return (
                                <div key={index} className="bg-gray-50 md:bg-transparent rounded-lg p-3 md:p-0 border md:border-0 border-gray-200">
                                    {/* Mobile View - Stacked Layout */}
                                    <div className="md:hidden space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500">Product</span>
                                            <span className="text-sm font-medium text-gray-800">GHC {unitPrice.toFixed(2)}</span>
                                        </div>
                                        <select
                                            value={item.product_id}
                                            onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                                            className="w-full h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                        >
                                            <option value={0}>Select Product</option>
                                            {products.map((product) => {
                                                const isSelected = items.some((i, idx) => idx !== index && i.product_id === product.id);
                                                return (
                                                    <option key={product.id} value={product.id} disabled={isSelected}>
                                                        {product.product_name} - GHC {parseFloat(String(product.unit_price)).toFixed(2)}{isSelected ? ' (Selected)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        
                                        <div className="grid grid-cols-5 gap-2">
                                            <div className="col-span-1">
                                                <label className="text-xs font-medium text-gray-500 block mb-1">Qty</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.qty}
                                                    onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                                                    className="h-12 text-center"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <label className="text-xs font-medium text-gray-500 block mb-1">Discount</label>
                                                <div className="flex items-center gap-1 h-12">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={item.discount}
                                                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                        className="h-12 flex-1"
                                                    />
                                                    <div className="flex rounded-lg overflow-hidden border border-gray-300 h-12">
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateItem(index, 'discount_type', 'percentage')}
                                                            className={`px-3 h-full flex items-center justify-center text-sm ${item.discount_type === 'percentage' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                                                        >
                                                            %
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateItem(index, 'discount_type', 'value')}
                                                            className={`px-2 h-full flex items-center justify-center text-xs ${item.discount_type === 'value' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                                                        >
                                                            GH
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Line Total</span>
                                            <span className="text-lg font-bold text-purple-600">GHC {lineTotal.toFixed(2)}</span>
                                        </div>
                                        
                                        {items.length > 1 && (
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => removeItem(index)}
                                                className="w-full h-10"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Remove Item
                                            </Button>
                                        )}
                                    </div>

                                    {/* Desktop View - Horizontal Layout */}
                                    <div className="hidden md:flex items-end gap-4">
                                        <div className="flex-1">
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                                                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                            >
                                                <option value={0}>Select</option>
                                                {products.map((product) => {
                                                    const isSelected = items.some((i, idx) => idx !== index && i.product_id === product.id);
                                                    return (
                                                        <option key={product.id} value={product.id} disabled={isSelected}>
                                                            {product.product_name} - GHC {parseFloat(String(product.unit_price)).toFixed(2)}{isSelected ? ' (Selected)' : ''}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="w-20">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                                                className="h-12 text-center"
                                            />
                                        </div>
                                        <div className="w-40 flex items-center gap-1">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.discount}
                                                onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                className="h-12 w-16"
                                            />
                                            <div className="flex rounded-lg overflow-hidden border border-gray-300 h-12">
                                                <button 
                                                    type="button"
                                                    onClick={() => updateItem(index, 'discount_type', 'percentage')}
                                                    className={`px-3 h-full flex items-center justify-center text-sm ${item.discount_type === 'percentage' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                                                >
                                                    %
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => updateItem(index, 'discount_type', 'value')}
                                                    className={`px-2 h-full flex items-center justify-center text-xs ${item.discount_type === 'value' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                                                >
                                                    GH
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-24 text-right font-medium h-12 flex items-center justify-end">
                                            {lineTotal.toFixed(2)}
                                        </div>
                                        <div className="w-10">
                                            {items.length > 1 && (
                                                <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)} className="h-10 w-10 p-0">
                                                    X
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base md:text-lg">Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="delivery_date" className="flex items-center gap-1 text-sm">
                                        Delivery Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="delivery_date"
                                        type="date"
                                        value={data.delivery_date}
                                        onChange={(e) => setData('delivery_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-12 md:h-10 mt-1"
                                        required
                                    />
                                    {errors.delivery_date && (
                                        <p className="text-red-500 text-sm mt-1">{errors.delivery_date}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="delivery_time" className="flex items-center gap-1 text-sm">
                                        Delivery Time <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="delivery_time"
                                        value={data.delivery_time}
                                        onChange={(e) => setData('delivery_time', e.target.value)}
                                        className="flex h-12 md:h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                                        required
                                    >
                                        <option value="00:00">12:00 AM</option>
                                        <option value="01:00">01:00 AM</option>
                                        <option value="02:00">02:00 AM</option>
                                        <option value="03:00">03:00 AM</option>
                                        <option value="04:00">04:00 AM</option>
                                        <option value="05:00">05:00 AM</option>
                                        <option value="06:00">06:00 AM</option>
                                        <option value="07:00">07:00 AM</option>
                                        <option value="08:00">08:00 AM</option>
                                        <option value="09:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="13:00">01:00 PM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="16:00">04:00 PM</option>
                                        <option value="17:00">05:00 PM</option>
                                        <option value="18:00">06:00 PM</option>
                                        <option value="19:00">07:00 PM</option>
                                        <option value="20:00">08:00 PM</option>
                                        <option value="21:00">09:00 PM</option>
                                        <option value="22:00">10:00 PM</option>
                                        <option value="23:00">11:00 PM</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="is_vat"
                                    type="checkbox"
                                    checked={data.is_vat}
                                    onChange={(e) => setData('is_vat', e.target.checked)}
                                    className="rounded border-gray-300 w-5 h-5"
                                />
                                <Label htmlFor="is_vat" className="text-sm">Apply VAT (20%)</Label>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>GHC {subtotal.toFixed(2)}</span>
                                </div>
                                {data.is_vat && (
                                    <div className="flex justify-between">
                                        <span>VAT (20%):</span>
                                        <span>GHC {vat.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span className="text-purple-600">GHC {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 md:gap-4 justify-end">
                        <Button type="button" variant="outline" onClick={() => window.history.back()} className="h-12 md:h-10 flex-1 md:flex-none">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="h-12 md:h-10 flex-1 md:flex-none">
                            Create Order
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
