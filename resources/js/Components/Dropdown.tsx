import { useState, createContext, useContext, PropsWithChildren } from 'react';
import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';

interface DropdownContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
    close: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function Dropdown({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    return (
        <DropdownContext.Provider value={{ open, setOpen, close }}>
            <div className="relative">{children}</div>
        </DropdownContext.Provider>
    );
}

function DropdownTrigger({ children }: PropsWithChildren) {
    const context = useContext(DropdownContext);
    if (!context) throw new Error('DropdownTrigger must be used within Dropdown');

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                context.setOpen(!context.open);
            }}
            className="flex items-center"
        >
            {children}
        </button>
    );
}

function DropdownContent({ children }: PropsWithChildren) {
    const context = useContext(DropdownContext);
    if (!context) throw new Error('DropdownContent must be used within Dropdown');

    return (
        <Transition
            show={context.open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                className="absolute z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                onClick={context.close}
            >
                {children}
            </div>
        </Transition>
    );
}

function DropdownLink({ href, method = 'get', as = 'a', children }: { href: string; method?: string; as?: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            method={method as 'get' | 'post' | 'put' | 'patch' | 'delete'}
            as={as as 'a' | 'button'}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
            {children}
        </Link>
    );
}

Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
Dropdown.Link = DropdownLink;

export default Dropdown;
