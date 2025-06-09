// app/dashboard/referenciales/[id]/edit/page.tsx

import Form from '@/components/ui/referenciales/edit-form';
import Breadcrumbs from '@/components/ui/referenciales/breadcrumbs';
import { fetchReferencialById } from '@/lib/referenciales';
import { fetchUsers } from '@/lib/users';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page(props: PageProps) {
    const params = await props.params;
    const id = params.id;
    const referencial: any = await fetchReferencialById(id);
    const users: any = await fetchUsers();

    if (!referencial) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Referenciales', href: '/dashboard/referenciales' },
                    {
                        label: 'Edit Referencial',
                        href: `/dashboard/referenciales/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            {/* Pasamos la lista de usuarios al componente Form */}
            <Form referencial={referencial} users={users} />
        </main>
    );
}